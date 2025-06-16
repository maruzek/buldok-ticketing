<?php

namespace App\Controller;

use App\Repository\EntranceRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/admin/users', name: 'api_users_')]
#[IsGranted('ROLE_ADMIN')]
/**
 * UserController handles user management operations.
 * It allows fetching all users, getting a user by ID, editing a user by ID, and searching for users.
 */
final class UserController extends AbstractController
{
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
        foreach ($users as $user) {
            $userData[] = [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'roles' => $user->getRoles(),
                'registeredAt' => $user->getRegisteredAt()->format('d.n.Y H:i'),
                'fullName' => $user->getFullName(),
            ];
        }

        return $this->json($userData, JsonResponse::HTTP_OK);
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
    public function getById(int $id, UserRepository $userRepository): JsonResponse
    {
        $user = $userRepository->findOneBy(['id' => $id]);

        if (!$user) {
            return $this->json([
                'error' => 'User not found',
            ], JsonResponse::HTTP_NOT_FOUND);
        }
        $userData = [
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'roles' => $user->getRoles(),
            'fullName' => $user->getFullName(),
            'verified' => $user->isVerified(),
            'entrance' => $user->getEntrance() ? [
                'id' => $user->getEntrance()->getId(),
                'name' => $user->getEntrance()->getName(),
            ] : null,
        ];

        return $this->json($userData, JsonResponse::HTTP_OK);
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
    public function editById(int $id, UserRepository $userRepository, Request $request, EntityManagerInterface $em, EntranceRepository $entranceRepository): JsonResponse
    {
        if (json_last_error() !== JSON_ERROR_NONE) {
            return $this->json([
                'error' => 'Invalid JSON',
            ], JsonResponse::HTTP_BAD_REQUEST);
        }

        $user = $userRepository->findOneBy(['id' => $id]);
        $data = json_decode($request->getContent(), true);

        if (!$user) {
            return $this->json([
                'error' => 'User not found',
            ], JsonResponse::HTTP_NOT_FOUND);
        }

        $newRoles = $data['roles'] ?? [];

        /** @var User|null $authUser */
        $authUser = $this->getUser();

        if (in_array("ROLE_ADMIN", $user->getRoles()) && !in_array("ROLE_ADMIN", $newRoles) && $user->getId() == $authUser->getId()) {
            return $this->json([
                'error' => 'Cannot remove admin role from yourself',
                'message' => 'Nemůžete odebrat roli admina sami sobě',
            ], JsonResponse::HTTP_FORBIDDEN);
        }

        if (!in_array("ROLE_USER", $newRoles)) {
            $newRoles += ['ROLE_USER'];
        }

        $newEntrance = null;

        if ($data['entrance']) {
            $newEntrance = $entranceRepository->findOneBy(['id' => $data['entrance']['id']]);
        } else if ($data['entrance'] === null && $user->getEntrance()) {
            $newEntrance = $user->getEntrance();
        } else {
            $newEntrance = null;
        }

        $user->setRoles($newRoles ?? $user->getRoles());
        $user->setVerified($data['verified'] ?? $user->isVerified());
        $user->setEntrance($newEntrance);

        try {
            $em->flush();
        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Error updating user',
                'message' => $e->getMessage(),
            ], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }

        $userData = [
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'roles' => $user->getRoles(),
            'fullName' => $user->getFullName(),
            'verified' => $user->isVerified(),
            'entrance' => $user->getEntrance() ? [
                'id' => $user->getEntrance()->getId(),
                'name' => $user->getEntrance()->getName(),
            ] : null,
        ];

        return $this->json([
            'status' => 'ok',
            'message' => 'Uživatel ' . $user->getFullName()  . ' byl úspěšně upraven',
            'updatedUser' => $userData,
        ], JsonResponse::HTTP_OK);
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
            return $this->json([
                'error' => 'Query parameter "q" is required',
            ], JsonResponse::HTTP_BAD_REQUEST);
        }

        $users = $userRepository->searchByEmailOrName($query);
        $userData = [];
        foreach ($users as $user) {
            $userData[] = [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'fullName' => $user->getFullName(),
            ];
        }

        return $this->json($userData, JsonResponse::HTTP_OK);
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
            return $this->json(['error' => 'User not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        $user->setEntrance(null);

        try {
            $em->flush();
        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Failed to remove entrance',
                'message' => $e->getMessage(),
            ], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }

        return $this->json(['status' => 'OK'], JsonResponse::HTTP_OK);
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
            return $this->json([
                'error' => 'User not found',
                'message' => 'Uživatel nenalezen'
            ], JsonResponse::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        if (!isset($data['entranceID'])) {
            return $this->json(['error' => 'Entrance ID is required'], JsonResponse::HTTP_BAD_REQUEST);
        }

        $entrance = $entranceRepository->find($data['entranceID']);

        if (!$entrance) {
            return $this->json(['error' => 'Entrance not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        $user->setEntrance($entrance);

        try {
            $em->flush();
        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Failed to change entrance',
                'message' => $e->getMessage(),
            ], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }

        return $this->json(['status' => 'OK'], JsonResponse::HTTP_OK);
    }
}
