<?php

namespace App\Controller;

use App\Entity\Game;
use App\Entity\User;
use App\Enum\MatchStatus;
use App\Repository\GameRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Serializer\SerializerInterface;

//TODO: refactor controller to match admin structure
// TODO: Automatically Fetching Objects (EntityValueResolver)
// #[Route('/api/match', name: 'app_match_')]
final class MatchController extends AbstractController
{
    #[Route('/api/admin/match/create', name: 'create', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    /**
     * Create a new match.
     *
     * @param Request $request The request containing the match data.
     * @param EntityManagerInterface $em The entity manager to persist the new match.
     *
     * @return JsonResponse
     */
    public function createMatch(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new BadRequestHttpException('Invalid JSON');
        }

        if (!isset($data['rival'])) {
            throw new BadRequestHttpException('Rival is required');
        }

        if (!isset($data['matchDate'])) {
            throw new BadRequestHttpException('Date is required');
        }

        $match = new Game();
        $match->setRival($data['rival']);

        try {
            // parse ISO8601 date (including timezone) in UTC to prevent local offset
            $date = new \DateTime($data['matchDate']);
        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Invalid date format',
            ], JsonResponse::HTTP_BAD_REQUEST);
        }

        $match->setPlayedAt($date);
        $match->setDescription($data['description'] ?? null);
        $match->setStatus(MatchStatus::ACTIVE);

        try {
            $em->persist($match);
            $em->flush();
        } catch (\Exception $e) {
            throw new BadRequestHttpException('Failed to create match');
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

    // #[Route('/api/admin/matches/list', name: 'list_matches', methods: ['GET'])]
    #[Route('/api/matches', name: 'list_matches', methods: ['GET'])]
    /**
     * List all matches.
     *
     * @param GameRepository $gameRepository
     * @return JsonResponse
     */
    public function listMatches(GameRepository $gameRepository, Request $request, SerializerInterface $serializer): JsonResponse
    {
        $criteria = [];

        if ($this->isGranted("ROLE_ADMIN")) {
            $statusParam = $request->query->get('status');
            if ($statusParam) {
                $statusEnum = MatchStatus::tryFrom($statusParam);

                if (!$statusEnum) {
                    throw new BadRequestHttpException('Invalid status value, must be one of: ' . implode(', ', array_column(MatchStatus::cases(), 'value')));
                }

                $criteria['status'] = $statusEnum;
            }
        } else {
            $criteria['status'] = MatchStatus::ACTIVE;
        }

        $matches =  $gameRepository->findBy($criteria, ['playedAt' => 'DESC']);

        $result = $serializer->serialize($matches, 'json', ['groups' => ['match:read']]);

        return JsonResponse::fromJsonString($result, JsonResponse::HTTP_OK);
    }

    #[Route('/api/match/{id}', name: 'get_match', methods: ['GET'])]
    /**
     * Get match by ID.
     *
     * @param int $id The ID of the match.
     * @param GameRepository $gameRepository The repository to fetch the match.
     * @param SerializerInterface $serializer The serializer to format the response.
     *
     * @return JsonResponse
     */
    public function getMatchById(int $id, GameRepository $gameRepository, SerializerInterface $serializer): JsonResponse
    {
        $match = $gameRepository->find($id);

        if (!$match) {
            throw new NotFoundHttpException('Match not found');
        }

        if ($match->getStatus() === MatchStatus::FINISHED && !in_array("ROLE_ADMIN", $this->getUser()->getRoles())) {
            throw new BadRequestHttpException('Match is canceled');
        }

        return $this->json([
            'id' => $match->getId(),
            'rival' => $match->getRival(),
            'playedAt' => $match->getPlayedAt(),
            'description' => $match->getDescription(),
            'status' => $match->getStatus(),
        ], JsonResponse::HTTP_OK);
    }

    #[Route('/api/admin/match/{id}', name: 'edit_match', methods: ['PUT'])]
    #[IsGranted('ROLE_ADMIN')]
    /**
     * Edit a match by ID.
     *
     * @param int $id The ID of the match to edit.
     * @param GameRepository $gameRepository The repository to fetch the match.
     * @param Request $request The request containing the updated match data.
     * @param EntityManagerInterface $em The entity manager to persist the changes.
     *
     * @return JsonResponse
     */
    public function editMatchById(int $id, GameRepository $gameRepository, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $match = $gameRepository->find($id);

        if (!$match) {
            throw new NotFoundHttpException('Match not found');
        }

        $data = json_decode($request->getContent(), true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new BadRequestHttpException('Invalid JSON');
        }

        if (!isset($data['rival'])) {
            throw new BadRequestHttpException('Rival is required');
        }

        if (isset($data['status'])) {
            try {
                $enumStatus = MatchStatus::from($data['status']);
                $match->setStatus($enumStatus);
            } catch (\ValueError $e) {
                throw new BadRequestHttpException('Invalid status value, must be one of: ' . implode(', ', array_column(MatchStatus::cases(), 'value')));
            }
        }


        $match->setRival($data['rival'] ?? $match->getRival());
        $match->setPlayedAt(new \DateTime($data['matchDate'] ?? $match->getPlayedAt()));
        $match->setDescription($data['description'] ?? $match->getDescription());

        try {
            $em->flush();
        } catch (\Exception $e) {
            throw new BadRequestHttpException('Failed to update match');
        }

        return $this->json([
            'id' => $match->getId(),
            'rival' => $match->getRival(),
            'playedAt' => $match->getPlayedAt(),
            'description' => $match->getDescription(),
            'status' => $match->getStatus(),
        ], JsonResponse::HTTP_OK);
    }

    #[Route('/api/users-matches', name: 'users_matches', methods: ['GET'])]
    /**
     * Get matches for the authenticated user.
     *
     * @param GameRepository $gameRepository The repository to fetch matches.
     *
     * @return JsonResponse
     */
    public function getUsersMatches(GameRepository $gameRepository): JsonResponse
    {
        /** @var User $authUser */
        $authUser = $this->getUser();

        if (!$authUser || !$authUser->getEntrance()) {
            return $this->json(['error' => 'Uživatel nenalezen nebo nemá definovaný vchod'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        $matches = $gameRepository->findBy(['status' => MatchStatus::ACTIVE], ['played_at' => 'ASC']);

        if (!$matches) {
            return $this->json([], JsonResponse::HTTP_OK);
        }

        $matchList = [];
        foreach ($matches as $match) {
            $matchList[] = [
                'id' => $match->getId(),
                'rival' => $match->getRival(),
                'playedAt' => $match->getPlayedAt(),
                'description' => $match->getDescription(),
                'status' => $match->getStatus(),
            ];
        }

        return $this->json($matchList, JsonResponse::HTTP_OK);
    }

    #[Route('/api/admin/matches/last-active-match', name: 'last_active_match', methods: ['GET'])]
    #[IsGranted('ROLE_ADMIN')]
    /**
     * Get the last active match.
     *
     * @param GameRepository $gameRepository The repository to fetch the last active match.
     * @param SerializerInterface $serializer The serializer to format the response.
     *
     * @return JsonResponse
     */
    public function getLastActiveMatch(GameRepository $gameRepository, SerializerInterface $serializer): JsonResponse
    {
        $match = $gameRepository->findLastActiveMatch();

        if (!$match) {
            throw new NotFoundHttpException('No active match found');
        }

        $match = $serializer->serialize($match, 'json', [
            'groups' => ['game:admin_dashboard', 'purchase:admin_game_summary'],
            'circular_reference_handler' => function ($object) {
                return $object->getId();
            },
        ]);

        return JsonResponse::fromJsonString($match, JsonResponse::HTTP_OK);
    }

    #[Route('/api/matches/{id}/stats', name: 'full_match_stats', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    /**
     * Get full statistics for a match by ID.
     *
     * @param GameRepository $gameRepository The repository to fetch the last active match.
     * @param SerializerInterface $serializer The serializer to format the response.
     *
     * @return JsonResponse
     */
    public function getFullMatchStats(int $id, GameRepository $gameRepository, SerializerInterface $serializer, Request $request): JsonResponse
    {
        $isAdmin = $this->isGranted('ROLE_ADMIN');
        /** @var User $authUser */
        $authUser = $this->getUser();

        $limit = $request->query->get('userEntranceLimit') == 1 ? true : false;

        $entrance = $authUser->getEntrance();
        if (!$entrance) {
            throw new BadRequestHttpException('User does not have an entrance assigned');
        }

        if ($limit || (!$isAdmin && !$limit)) {
            $match = $gameRepository->findWithFilteredPurchases($id, $entrance->getId());
        } else if ($isAdmin && !$limit) {
            $match = $gameRepository->find($id);
        }

        if (!$match) {
            throw new NotFoundHttpException('Match not found');
        }

        if ($match->getStatus() === MatchStatus::FINISHED && !$isAdmin) {
            throw new BadRequestHttpException('Match has finished');
        }

        $match = $serializer->serialize($match, 'json', [
            'groups' => ['game:admin_dashboard', 'purchase:admin_game_summary'],
            'circular_reference_handler' => function ($object) {
                return $object->getId();
            },
        ]);

        return JsonResponse::fromJsonString($match, JsonResponse::HTTP_OK);
    }
}
