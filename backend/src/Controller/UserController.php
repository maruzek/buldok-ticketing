<?php

namespace App\Controller;

use App\Repository\EntranceRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/admin/users', name: 'api_users_')]
final class UserController extends AbstractController
{
    #[Route('/all', name: 'all', methods: ['GET'])]
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

        if (!in_array("ROLE_USER", $newRoles)) {
            $newRoles += ['ROLE_USER'];
        }

        $oldEntrance = $user->getEntrance();

        $user->setRoles($newRoles ?? $user->getRoles());
        $user->setVerified($data['verified'] ?? $user->isVerified());
        $user->setEntrance($entranceRepository->findOneBy(['id' => $data['entrance']]) ?? $user->getEntrance());

        try {
            $em->flush();
        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Error updating user',
                'message' => $e->getMessage(),
            ], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }


        // $user->setRoles(['ROLE_USER']);

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
            'satus' => 'OK',
            'message' => 'User updated successfully',
            'updatedUser' => $userData,
        ], JsonResponse::HTTP_OK);
    }

    #[Route('/search', name: 'searchUser', methods: ['GET'])]
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
}
