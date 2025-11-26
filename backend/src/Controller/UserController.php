<?php

namespace App\Controller;

use App\Entity\User;
use App\Enum\UserStatus;
use App\Repository\EntranceRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Exception;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Config\Definition\Exception\ForbiddenOverwriteException;
use Symfony\Component\HttpFoundation\Exception\BadRequestException;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/v1/users', name: 'api_v1_users_')]
#[IsGranted('ROLE_ADMIN')]
/**
 * UserController handles user management operations.
 * It allows fetching all users, getting a user by ID, editing a user by ID, and searching for users.
 */
final class UserController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly SerializerInterface $serializer,
        private readonly ValidatorInterface $validator,
        private readonly EntranceRepository $entranceRepository,
        private readonly UserRepository $userRepository
    ) {}

    #[Route('/', name: 'all', methods: ['GET'])]
    /**
     * Fetch all users.
     *
     * @param UserRepository $userRepository Repository to fetch users.
     *
     * @return JsonResponse
     */
    public function list(): JsonResponse
    {
        $users = $this->userRepository->findByStatuses();

        $json = $this->serializer->serialize($users, 'json', [
            'groups' => ['user:read'],
            'circular_reference_handler' => function ($object) {
                return $object->getId();
            },
        ]);

        return JsonResponse::fromJsonString($json, JsonResponse::HTTP_OK);
    }

    #[Route('/search', name: 'searchUser', methods: ['GET'], requirements: ['q' => '.+'])]
    /**
     * Search for users by email or name.
     *
     * @param UserRepository $userRepository Repository to search users.
     * @param Request $request The request containing the search query.
     *
     * @return JsonResponse
     */
    public function search(Request $request): JsonResponse
    {
        $query = $request->query->get('q');
        if (!$query) {
            throw new BadRequestException('Parametr dotazu "q" je povinný');
        }

        $users = $this->userRepository->searchByEmailOrName($query);

        $json = $this->serializer->serialize($users, 'json', [
            'groups' => ['user:search'],
            'circular_reference_handler' => function ($object) {
                return $object->getId();
            },
        ]);

        return JsonResponse::fromJsonString($json, JsonResponse::HTTP_OK);
    }

    #[Route('/{id}', name: 'get_by_id', methods: ['GET'], requirements: ['id' => '\d+'])]
    /**
     * Get a user by ID.
     *
     * @param int $id The ID of the user to fetch.
     * @param UserRepository $userRepository Repository to fetch the user.
     *
     * @return JsonResponse
     */
    public function getById(User $user): JsonResponse
    {
        $json = $this->serializer->serialize($user, 'json', [
            'groups' => ['user:read'],
            'circular_reference_handler' => function ($object) {
                return $object->getId();
            },
        ]);

        return JsonResponse::fromJsonString($json, JsonResponse::HTTP_OK);
    }

    #[Route('/{id}', name: 'edit', methods: ['PUT', 'PATCH'], requirements: ['id' => '\d+'])]
    /**
     * Edit a user by ID.
     *
     * @param int $id The ID of the user to edit.
     * @param UserRepository $userRepository Repository to fetch the user.
     * @param Request $request The request containing the new user data.
     * @param EntityManagerInterface $em The entity manager to handle database operations.
     * @param EntranceRepository $entranceRepository Repository to fetch entrances.
     *
     * @return JsonResponse
     */
    public function editById(User $user, Request $request): JsonResponse
    {
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new BadRequestException('Neplatná data');
        }

        $data = json_decode($request->getContent(), true);

        $validations = $this->validator->validate($data);

        if (count($validations) > 0) {
            $errors = [];
            foreach ($validations as $violation) {
                $errors[] = [
                    'property' => $violation->getPropertyPath(),
                    'message' => $violation->getMessage(),
                ];
            }
            throw new BadRequestException('Nastala chyba: ' . json_encode($errors));
        }

        if (array_key_exists('roles', $data)) {
            $newRoles = $data['roles'];
            /** @var User|null $authUser */
            $authUser = $this->getUser();

            if (in_array("ROLE_ADMIN", $user->getRoles()) && !in_array("ROLE_ADMIN", $newRoles) && $user->getId() == $authUser->getId()) {
                throw new ForbiddenOverwriteException('Nemůžete odebrat svou vlastní roli správce');
            }
            if (!in_array("ROLE_USER", $newRoles)) {
                $newRoles[] = 'ROLE_USER';
            }
            $user->setRoles($newRoles);
        }

        if (array_key_exists('entranceId', $data)) {
            $entranceId = $data['entranceId'];

            if ($entranceId === null) {
                $user->setEntrance(null);
            } else {
                $newEntrance = $this->entranceRepository->find($entranceId);
                if (!$newEntrance) {
                    throw new NotFoundHttpException('Vstup s tímto ID neexistuje');
                }
                $user->setEntrance($newEntrance);
            }
        }

        if (array_key_exists('status', $data)) {
            $user->setStatus(UserStatus::from($data['status']));
        }

        try {
            $this->em->flush();
        } catch (\Exception $e) {
            throw new \Exception('Nastala chyba při aktualizaci uživatele: ' . $e->getMessage());
        }

        $json = $this->serializer->serialize($user, 'json', [
            'groups' => ['user:read'],
            'circular_reference_handler' => function ($object) {
                return $object->getId();
            },
        ]);

        return JsonResponse::fromJsonString($json, JsonResponse::HTTP_OK);
    }



    #[Route('/{id}', name: 'remove_by_id', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    #[IsGranted('ROLE_ADMIN')]
    /**
     * Remove a user by ID.
     *
     * @param User $user The user to remove.
     *
     * @return JsonResponse
     */
    public function removeById(User $user): JsonResponse
    {
        /** @var User|null $authUser */
        $authUser = $this->getUser();

        if ($user->getId() == $authUser->getId()) {
            throw new BadRequestException('Nemůžete odebrat svou vlastní roli správce');
        }

        $user->setStatus(UserStatus::REMOVED);

        try {
            $this->em->flush();
        } catch (\Exception $e) {
            throw new \Exception('Nastala chyba při aktualizaci uživatele: ' . $e->getMessage());
        }

        $json = $this->serializer->serialize($user, 'json', [
            'groups' => ['user:read'],
            'circular_reference_handler' => function ($object) {
                return $object->getId();
            },
        ]);

        return JsonResponse::fromJsonString($json, JsonResponse::HTTP_OK);
    }
}
