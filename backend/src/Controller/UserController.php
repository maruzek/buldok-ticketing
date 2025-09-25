<?php

namespace App\Controller;

use App\Entity\User;
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

#[Route('/api/admin/users', name: 'api_users_')]
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

    #[Route('/all', name: 'all', methods: ['GET'])]
    /**
     * Fetch all users.
     *
     * @param UserRepository $userRepository Repository to fetch users.
     *
     * @return JsonResponse
     */
    public function index(UserRepository $userRepository): JsonResponse
    {
        $users = $userRepository->findAll();
        $userData = [];

        $json = $this->serializer->serialize($users, 'json', [
            'groups' => ['user:read'],
            'circular_reference_handler' => function ($object) {
                return $object->getId();
            },
        ]);

        return JsonResponse::fromJsonString($json, JsonResponse::HTTP_OK);
    }

    #[Route('/user/{id}', name: 'get_by_id', methods: ['GET'])]
    /**
     * Get a user by ID.
     *
     * @param int $id The ID of the user to fetch.
     * @param UserRepository $userRepository Repository to fetch the user.
     *
     * @return JsonResponse
     */
    public function getById(int $id): JsonResponse
    {
        $user = $this->userRepository->findOneBy(['id' => $id]);

        if (!$user) {
            throw new NotFoundHttpException('User not found');
        }

        $json = $this->serializer->serialize($user, 'json', [
            'groups' => ['user:read'],
            'circular_reference_handler' => function ($object) {
                return $object->getId();
            },
        ]);

        return JsonResponse::fromJsonString($json, JsonResponse::HTTP_OK);
    }

    #[Route('/user/{id}', name: 'edit_by_id', methods: ['PUT'])]
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
    public function editById(User $user, int $id, Request $request): JsonResponse
    {
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new BadRequestException('Invalid JSON data');
        }

        // $user = $userRepository->findOneBy(['id' => $id]);
        $data = json_decode($request->getContent(), true);

        if (!$user) {
            throw new NotFoundHttpException('User not found');
        }

        $validations = $this->validator->validate($data);

        if (count($validations) > 0) {
            $errors = [];
            foreach ($validations as $violation) {
                $errors[] = [
                    'property' => $violation->getPropertyPath(),
                    'message' => $violation->getMessage(),
                ];
            }
            throw new BadRequestException('Validation failed: ' . json_encode($errors));
        }

        $newRoles = $data['roles'] ?? [];

        /** @var User|null $authUser */
        $authUser = $this->getUser();

        if (in_array("ROLE_ADMIN", $user->getRoles()) && !in_array("ROLE_ADMIN", $newRoles) && $user->getId() == $authUser->getId()) {
            throw new ForbiddenOverwriteException('You cannot remove your own admin role');
        }

        if (!in_array("ROLE_USER", $newRoles)) {
            $newRoles += ['ROLE_USER'];
        }

        $newEntrance = null;

        if ($data['entrance']) {
            $newEntrance = $this->entranceRepository->findOneBy(['id' => $data['entrance']['id']]);
        } else if ($data['entrance'] === null && $user->getEntrance()) {
            $newEntrance = $user->getEntrance();
        } else {
            $newEntrance = null;
        }

        $user->setRoles($newRoles ?? $user->getRoles());
        $user->setVerified($data['verified'] ?? $user->isVerified());
        $user->setEntrance($newEntrance);

        try {
            $this->em->flush();
        } catch (\Exception $e) {
            throw new \Exception('Error updating user', 500);
        }

        $json = $this->serializer->serialize($user, 'json', [
            'groups' => ['user:read'],
            'circular_reference_handler' => function ($object) {
                return $object->getId();
            },
        ]);

        return JsonResponse::fromJsonString($json, JsonResponse::HTTP_OK);
    }

    #[Route('/search', name: 'searchUser', methods: ['GET'])]
    /**
     * Search for users by email or name.
     *
     * @param UserRepository $userRepository Repository to search users.
     * @param Request $request The request containing the search query.
     *
     * @return JsonResponse
     */
    public function searchUser(UserRepository $userRepository, Request $request): JsonResponse
    {
        $query = $request->query->get('q');
        if (!$query) {
            throw new BadRequestException('Query parameter "q" is required');
        }

        $users = $userRepository->searchByEmailOrName($query);

        $json = $this->serializer->serialize($users, 'json', [
            'groups' => ['user:search'],
            'circular_reference_handler' => function ($object) {
                return $object->getId();
            },
        ]);

        return JsonResponse::fromJsonString($json, JsonResponse::HTTP_OK);
    }

    #[Route('/user/{id}/remove-entrance', name: 'remove_entrance', methods: ['PUT'])]
    /**
     * Remove the entrance from a user.
     *
     * @param int $id The ID of the user.
     * @param UserRepository $userRepository Repository to fetch the user.
     * @param EntityManagerInterface $em The entity manager to handle database operations.
     *
     * @return JsonResponse
     */
    public function removeEntrance(int $id, UserRepository $userRepository, EntityManagerInterface $em): JsonResponse
    {
        $user = $userRepository->find($id);

        if (!$user) {
            throw new NotFoundHttpException('User not found');
        }

        $user->setEntrance(null);

        try {
            $em->flush();
        } catch (\Exception $e) {
            throw new Exception('Failed to remove entrance from user', 500);
        }

        return $this->json(['status' => 'ok'], JsonResponse::HTTP_OK);
    }

    #[Route('/user/{id}/change-entrance', name: 'change_entrance', methods: ['PUT'])]
    /**
     * Change the entrance of a user.
     *
     * @param int $id The ID of the user.
     * @param UserRepository $userRepository Repository to fetch the user.
     * @param EntranceRepository $entranceRepository Repository to fetch entrances.
     * @param EntityManagerInterface $em The entity manager to handle database operations.
     * @param Request $request The request containing the new entrance ID.
     *
     * @return JsonResponse
     */
    public function changeEntrance(int $id, UserRepository $userRepository, EntranceRepository $entranceRepository, EntityManagerInterface $em, Request $request): JsonResponse
    {
        $user = $userRepository->find($id);

        if (!$user) {
            throw new NotFoundHttpException('User not found');
        }

        $data = json_decode($request->getContent(), true);

        if (!isset($data['entranceID'])) {
            throw new BadRequestHttpException('Entrance ID is required');
        }

        $entrance = $entranceRepository->find($data['entranceID']);

        if (!$entrance) {
            throw new NotFoundHttpException('Entrance not found');
        }

        $user->setEntrance($entrance);

        try {
            $em->flush();
        } catch (\Exception $e) {
            throw new Exception('Failed to change entrance for user', 500);
        }

        return $this->json(['status' => 'ok'], JsonResponse::HTTP_OK);
    }
}
