<?php

namespace App\Controller;

use App\Entity\Game;
use App\Entity\Purchase;
use App\Enum\MatchStatus;
use App\Repository\GameRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;

//TODO: refactor controller to match admin structure
// TODO: Automatically Fetching Objects (EntityValueResolver)
// #[Route('/api/match', name: 'app_match_')]
final class MatchController extends AbstractController
{
    #[Route('/api/admin/match/create', name: 'create', methods: ['POST'])]
    public function createMatch(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            return $this->json([
                'error' => 'Invalid JSON',
            ], JsonResponse::HTTP_BAD_REQUEST);
        }

        if (!isset($data['rival'])) {
            return $this->json([
                'error' => 'Rival is required',
            ], JsonResponse::HTTP_BAD_REQUEST);
        }

        if (!isset($data['matchDate'])) {
            return $this->json([
                'error' => 'Date is required',
            ], JsonResponse::HTTP_BAD_REQUEST);
        }

        $match = new Game();
        $match->setRival($data['rival']);
        $match->setPlayedAt(new \DateTime($data['matchDate']));
        $match->setDescription($data['description'] || null);
        $match->setStatus(MatchStatus::ACTIVE);

        try {
            $em->persist($match);
            $em->flush();
        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Failed to create match',
            ], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }

        return $this->json([
            'message' => 'Match created successfully',
            'match' => [
                'id' => $match->getId(),
                'rival' => $match->getRival(),
                'playedAt' => $match->getPlayedAt(),
                'description' => $match->getDescription(),
                'status' => $match->getStatus(),
            ],

        ], JsonResponse::HTTP_CREATED);
    }

    #[Route('/api/admin/match/list', name: 'list_match', methods: ['GET'])]
    public function listMatch(GameRepository $gameRepository): JsonResponse
    {
        $matches = $gameRepository->findAllMatches();

        $matchList = [];
        foreach ($matches as $match) {
            $matchList[] = [
                'id' => $match->getId(),
                'rival' => $match->getRival(),
                'playedAt' => $match->getPlayedAt()->format('d.m.Y H:i'),
                'description' => $match->getDescription(),
                'status' => $match->getStatus(),
            ];
        }

        return $this->json($matchList, JsonResponse::HTTP_OK);
    }

    #[Route('/api/match/{id}', name: 'get_match', methods: ['GET'])]
    public function getMatchById(int $id, GameRepository $gameRepository, SerializerInterface $serializer): JsonResponse
    {
        $match = $gameRepository->find($id);

        if (!$match) {
            return $this->json([
                'error' => 'Match not found',
            ], JsonResponse::HTTP_NOT_FOUND);
        }

        if ($match->getStatus() === MatchStatus::FINISHED && !in_array("ROLE_ADMIN", $this->getUser()->getRoles())) {
            return $this->json([
                'error' => 'Match is canceleddd',
            ], JsonResponse::HTTP_BAD_REQUEST);
        }

        /*
        $purchasesWithDetails = $purchaseRepository->findPurchasesWithDetailsByMatch($match, $this->getUser());

        // Serialize the purchases with a circular reference handler
        $jsonContent = $serializer->serialize($purchasesWithDetails, 'json', [
            'circular_reference_handler' => function ($object) {
                return $object->getId();
            },
        ]);
        
        */

        // $purchases = [];

        // /** @var Purchase $purchase */
        // foreach ($match->getPurchases() as $purchase) {
        //     $purchases[] = [
        //         'id' => $purchase->getId(),
        //         $purchase->getEntrance() ? 'entrance' => [
        //             'id' => $purchase->getEntrance()->getId(),
        //             'name' => $purchase->getEntrance()->getName(),
        //         ] : null,
        //         'purchasedAt' => $purchase->getPurchasedAt()->format('d.m.Y H:i'),

        //     ];
        // }

        return $this->json([
            'id' => $match->getId(),
            'rival' => $match->getRival(),
            'playedAt' => $match->getPlayedAt(),
            'description' => $match->getDescription(),
            'status' => $match->getStatus(),
        ], JsonResponse::HTTP_OK);
    }

    #[Route('/api/admin/match/{id}', name: 'edit_match', methods: ['PUT'])]
    public function editMatchById(int $id, GameRepository $gameRepository, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $match = $gameRepository->find($id);

        if (!$match) {
            return $this->json([
                'error' => 'Match not found',
            ], JsonResponse::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            return $this->json([
                'error' => 'Invalid JSON',
            ], JsonResponse::HTTP_BAD_REQUEST);
        }

        if (!isset($data['rival'])) {
            return $this->json([
                'error' => 'Rival is required',
            ], JsonResponse::HTTP_BAD_REQUEST);
        }

        if (isset($data['status'])) {
            try {
                $enumStatus = MatchStatus::from($data['status']);
                $match->setStatus($enumStatus);
            } catch (\ValueError $e) {
                return $this->json([
                    'error' => 'Invalid status value, must be one of: ' . implode(', ', array_column(MatchStatus::cases(), 'value')),
                ], JsonResponse::HTTP_BAD_REQUEST);
            }
        }


        $match->setRival($data['rival'] ?? $match->getRival());
        $match->setPlayedAt(new \DateTime($data['matchDate'] ?? $match->getPlayedAt()));
        $match->setDescription($data['description'] ?? $match->getDescription());

        try {
            $em->flush();
        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Failed to update match',
                'message' => $e->getMessage(),
            ], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }

        return $this->json([
            'id' => $match->getId(),
            'rival' => $match->getRival(),
            'playedAt' => $match->getPlayedAt(),
            'description' => $match->getDescription(),
            'status' => $match->getStatus(),
        ], JsonResponse::HTTP_OK);
    }

    #[Route('/users-matches', name: 'users_matches', methods: ['GET'])]
    public function getUsersMatches(GameRepository $gameRepository): JsonResponse
    {
        $matches = $gameRepository->findAllMatches();

        $matchList = [];
        foreach ($matches as $match) {
            $matchList[] = [
                'id' => $match->getId(),
                'rival' => $match->getRival(),
                'playedAt' => $match->getPlayedAt()->format('d.m.Y H:i'),
                'description' => $match->getDescription(),
                'status' => $match->getStatus(),
            ];
        }

        return $this->json($matchList, JsonResponse::HTTP_OK);
    }
}
