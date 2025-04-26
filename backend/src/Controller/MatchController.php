<?php

namespace App\Controller;

use App\Entity\Game;
use Doctrine\ORM\EntityManagerInterface;
use PhpParser\Node\Expr\Match_;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/match', name: 'app_match')]
final class MatchController extends AbstractController
{
    #[Route('/create', name: 'create_match', methods: ['POST'])]
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



        // Save the match data to the database
        $match = new Game();
        $match->setRival($data['rival']);
        $match->setPlayedAt(new \DateTime($data['matchDate']));
        $match->setDescription($data['description'] || null);

        try {
            $em->persist($match);
            $em->flush();
        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Failed to create match',
            ], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }

        // Return a success response
        return $this->json([
            'message' => 'Match created successfully',
            'match' => [
                'id' => $match->getId(),
                'rival' => $match->getRival(),
                'playedAt' => $match->getPlayedAt()->format('Y-m-d H:i:s'),
                'description' => $match->getDescription(),
            ],
        ]);

        // return $this->json([
        //     'message' => 'Welcome to your new controller!',
        //     'path' => 'src/Controller/ApiController.php',
        //     'data' => $data["password"],
        // ]);
    }

    #[Route('/list', name: 'list_match', methods: ['GET'])]
    public function listMatch(EntityManagerInterface $em): JsonResponse
    {
        $matches = $em->getRepository(Game::class)->findAll();

        $matchList = [];
        foreach ($matches as $match) {
            $matchList[] = [
                'id' => $match->getId(),
                'rival' => $match->getRival(),
                'playedAt' => $match->getPlayedAt()->format('Y-m-d H:i:s'),
                'description' => $match->getDescription(),
            ];
        }

        return $this->json($matchList);
    }
}
