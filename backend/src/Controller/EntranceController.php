<?php

namespace App\Controller;

use App\Entity\Entrance;
use App\Repository\EntranceRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/admin/entrance', name: 'api_entrance_')]
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
            $entranceData[] = [
                'id' => $entrance->getId(),
                'name' => $entrance->getName(),
                'location' => $entrance->getLocation(),
            ];
        }

        return $this->json($entranceData, JsonResponse::HTTP_OK);
    }
}
