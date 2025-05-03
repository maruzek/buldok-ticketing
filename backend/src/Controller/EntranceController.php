<?php

namespace App\Controller;

use App\Entity\Entrance;
use App\Repository\EntranceRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/admin/entrances', name: 'api_entrance_')]
final class EntranceController extends AbstractController
{
    #[Route('/create', name: 'create', methods: ['POST'])]
    public function index(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            return $this->json([
                'error' => 'Invalid JSON',
            ], JsonResponse::HTTP_BAD_REQUEST);
        }

        if (!$data['name']) {
            return $this->json([
                'error' => 'Name is required',
            ], JsonResponse::HTTP_BAD_REQUEST);
        }

        if ($em->getRepository(Entrance::class)->findOneBy(['name' => $data['name']])) {
            return $this->json([
                'error' => 'Entrance with this name already exists',
            ], JsonResponse::HTTP_BAD_REQUEST);
        }

        $entrance = new Entrance();

        $entrance->setName($data['name']);
        $entrance->setLocation($data['location'] ?? null);

        try {
            $em->persist($entrance);
            $em->flush();
        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Failed to create entrance',
            ], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }

        return $this->json([
            'message' => 'Entrance created successfully',
            'entrance' => [
                'name' => $entrance->getName(),
            ],
        ], JsonResponse::HTTP_CREATED);
    }

    #[Route('/all', name: 'all', methods: ['GET'])]
    public function all(EntranceRepository $entranceRepository): JsonResponse
    {
        $entrances = $entranceRepository->findAll();
        $entranceData = [];

        foreach ($entrances as $entrance) {
            $users = [];
            foreach ($entrance->getUsers() as $user) {
                if ($user->isVerified()) {
                    $users[] = [
                        'id' => $user->getId(),
                        'email' => $user->getEmail(),
                        'fullName' => $user->getFullName(),
                        'verified' => $user->isVerified(),
                    ];
                }
            }
            $entranceData[] = [
                'id' => $entrance->getId(),
                'name' => $entrance->getName(),
                'location' => $entrance->getLocation(),
                'users' => $entrance->getUsers(),
            ];
        }

        return $this->json($entranceData, JsonResponse::HTTP_OK);
    }


    #[Route('/entrance/{id}', name: 'get_by_id', methods: ['GET'])]
    public function getById(int $id, EntranceRepository $entranceRepository): JsonResponse
    {
        $entrance = $entranceRepository->findOneBy(['id' => $id]);

        if (!$entrance) {
            return $this->json([
                'error' => 'Entrance not found',
            ], JsonResponse::HTTP_NOT_FOUND);
        }

        $users = [];

        foreach ($entrance->getUsers() as $user) {
            $users[] = [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'fullName' => $user->getFullName(),
                'verified' => $user->isVerified(),
            ];
        }

        return $this->json([
            'id' => $entrance->getId(),
            'name' => $entrance->getName(),
            'location' => $entrance->getLocation(),
            'users' => $users,
        ], JsonResponse::HTTP_OK);
    }

    #[Route('/entrance/{id}', name: 'edit_by_id', methods: ['PUT'])]
    public function editById(int $id, EntranceRepository $entranceRepository, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $entrance = $entranceRepository->findOneBy(['id' => $id]);

        if (!$entrance) {
            return $this->json([
                'error' => 'Entrance not found',
            ], JsonResponse::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            return $this->json([
                'error' => 'Invalid JSON',
            ], JsonResponse::HTTP_BAD_REQUEST);
        }

        $entrance->setName($data['name'] ?? $entrance->getName());
        $entrance->setLocation($data['location'] ?? $entrance->getLocation());

        try {
            $em->flush();
        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Failed to update entrance',
                'message' => $e->getMessage(),
            ], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }

        return $this->json([
            'message' => 'Entrance updated successfully',
            'entrance' => [
                'id' => $entrance->getId(),
                'name' => $entrance->getName(),
                'location' => $entrance->getLocation(),
            ],
        ], JsonResponse::HTTP_OK);
    }
}
