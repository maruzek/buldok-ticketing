<?php

namespace App\Controller;

use App\DTO\CreateMatchDto;
use App\DTO\MatchStatisticsDto;
use App\Entity\Game;
use App\Entity\User;
use App\Enum\MatchStatus;
use App\Repository\GameRepository;
use App\Repository\SeasonRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/v1/matches', name: 'api_matches_')]
final class MatchController extends AbstractController
{
    public function __construct(
        private readonly GameRepository $gameRepository,
        private readonly EntityManagerInterface $em,
        private readonly SerializerInterface $serializer,
        private readonly SeasonRepository $seasonRepository,
    ) {}

    #[Route('/', name: 'create', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    /**
     * Create a new match.
     *
     * @param Request $request The request containing the match data.
     * @param EntityManagerInterface $em The entity manager to persist the new match.
     *
     * @return JsonResponse
     */
    public function createMatch(Request $request, ValidatorInterface $validator): JsonResponse
    {
        try {
            /** @var CreateMatchDto $dto */
            $dto = $this->serializer->deserialize($request->getContent(), CreateMatchDto::class, 'json');
        } catch (\Exception $e) {
            throw new BadRequestHttpException('Neplatný formát JSON');
        }

        $errors = $validator->validate($dto);
        if (count($errors) > 0) {
            $messages = [];
            foreach ($errors as $error) {
                $messages[] = $error->getMessage();
            }
            throw new BadRequestHttpException(implode('; ', $messages));
        }

        $match = new Game();
        $match->setRival($dto->rival);
        $match->setDescription($dto->description);

        $date = new \DateTime($dto->playedAt);
        $match->setPlayedAt($date);

        $season = $this->seasonRepository->findSeasonByDate($date);
        if (!$season) {
            throw new BadRequestHttpException('Sezóna nenalezena pro dané datum');
        }

        $match->setStatus(MatchStatus::ACTIVE);
        $match->setSeason($season);

        try {
            $this->em->persist($match);
            $this->em->flush();
        } catch (\Exception $e) {
            throw new BadRequestHttpException('Nastala chyba při vytváření zápasu');
        }

        $json = $this->serializer->serialize($match, 'json', ['groups' => ['match:read']]);

        return JsonResponse::fromJsonString($json, JsonResponse::HTTP_CREATED);
    }

    #[Route('/', name: 'list', methods: ['GET'])]
    /**
     * List all matches.
     *
     * @param GameRepository $gameRepository
     * @return JsonResponse
     */
    public function listMatches(GameRepository $gameRepository, Request $request, SerializerInterface $serializer): JsonResponse
    {
        $statuses = [];

        if ($this->isGranted("ROLE_ADMIN")) {
            $statusParam = $request->query->get('status');
            if ($statusParam) {
                if (str_contains($statusParam, ',')) {
                    $statusParams = explode(',', $statusParam);
                } else {
                    $statusParams = [$statusParam];
                }
                foreach ($statusParams as $statusParam) {
                    $statusEnum = MatchStatus::tryFrom($statusParam);

                    if (!$statusEnum) {
                        throw new BadRequestHttpException('Neplatná hodnota stavu, musí být jednou z: ' . implode(', ', array_column(MatchStatus::cases(), 'value')));
                    }

                    $statuses[] = $statusEnum;
                }
                $statusEnum = MatchStatus::tryFrom($statusParam);

                if (!$statusEnum) {
                    throw new BadRequestHttpException('Neplatná hodnota stavu, musí být jednou z: ' . implode(', ', array_column(MatchStatus::cases(), 'value')));
                }

                $statuses[] = $statusEnum;
            }
        } else {
            $statuses[] = MatchStatus::ACTIVE;
        }

        $matches =  $gameRepository->findByStatuses($statuses);

        $result = $serializer->serialize($matches, 'json', ['groups' => ['match:admin_list']]);

        return JsonResponse::fromJsonString($result, JsonResponse::HTTP_OK);
    }

    #[Route('/active', name: 'active', methods: ['GET'])]
    #[IsGranted('ROLE_ADMIN')]
    /**
     * Get the currently active match.
     *
     * Retrieves the most recent match with ACTIVE status, ordered by play date.
     * Used for AdminBasicInfo to display current match information.
     *
     * @return JsonResponse The active match data with game and purchase information
     * @throws NotFoundHttpException When no active match exists
     */
    public function getActive(): JsonResponse
    {
        $match = $this->gameRepository->findLastActiveMatch();

        if (!$match) {
            throw new NotFoundHttpException('Žádný aktivní zápas nenalezen');
        }

        $json = $this->serializer->serialize($match, 'json', [
            'groups' => ['game:admin_dashboard', 'purchase:admin_game_summary'],
            'circular_reference_handler' => function ($object) {
                return $object->getId();
            },
        ]);

        return JsonResponse::fromJsonString($json, JsonResponse::HTTP_OK);
    }

    #[Route('/{id}', name: 'get_match', methods: ['GET'], requirements: ['id' => '\d+'])]
    /**
     * Get match by ID.
     *
     * @param int $id The ID of the match.
     * @param GameRepository $gameRepository The repository to fetch the match.
     * @param SerializerInterface $serializer The serializer to format the response.
     *
     * @return JsonResponse
     */
    public function getMatchById(Game $match): JsonResponse
    {
        if ($match->getStatus() === MatchStatus::FINISHED && !in_array("ROLE_ADMIN", $this->getUser()->getRoles())) {
            throw new BadRequestHttpException('Zápas byl zrušen');
        }

        $json = $this->serializer->serialize($match, 'json', ['groups' => ['match:read']]);

        return JsonResponse::fromJsonString($json, JsonResponse::HTTP_OK);
    }

    #[Route('/{id}', name: 'edit_match', methods: ['PUT'], requirements: ['id' => '\d+'])]
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
    public function editMatchById(Game $match, Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new BadRequestHttpException('Neplatná data');
        }

        if (!isset($data['rival'])) {
            throw new BadRequestHttpException('Soupeř je povinný');
        }

        $activeMatches = $this->gameRepository->findBy(['status' => MatchStatus::ACTIVE]);

        if ($data['status'] === MatchStatus::ACTIVE->value && count($activeMatches) > 0) {
            if ($match->getStatus() !== MatchStatus::ACTIVE) {
                throw new BadRequestHttpException('Jen jeden zápas může být aktivní, nejdříve upravte stávající aktivní zápas');
            }
        }

        if (isset($data['status'])) {
            try {
                $enumStatus = MatchStatus::from($data['status']);
                $match->setStatus($enumStatus);
            } catch (\ValueError $e) {
                throw new BadRequestHttpException('Neplatná hodnota stavu, musí být jednou z: ' . implode(', ', array_column(MatchStatus::cases(), 'value')));
            }
        }

        $match->setRival($data['rival'] ?? $match->getRival());
        $match->setPlayedAt(new \DateTime($data['matchDate'] ?? $match->getPlayedAt()));
        $match->setDescription($data['description'] ?? $match->getDescription());

        try {
            $this->em->flush();
        } catch (\Exception $e) {
            throw new BadRequestHttpException('Nastala chyba při aktualizaci zápasu');
        }

        $json = $this->serializer->serialize($match, 'json', ['groups' => ['match:read']]);

        return JsonResponse::fromJsonString($json, JsonResponse::HTTP_OK);
    }

    #[Route('/{id}', name: 'remove', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    #[IsGranted('ROLE_ADMIN')]
    /**
     * Set a match as removed by ID.
     *
     * @param int $id The ID of the match to edit.
     * @param GameRepository $gameRepository The repository to fetch the match.
     * @param Request $request The request containing the updated match data.
     * @param EntityManagerInterface $em The entity manager to persist the changes.
     *
     * @return JsonResponse
     */
    public function removeMatchById(Game $match): JsonResponse
    {
        $match->setStatus(MatchStatus::REMOVED);

        try {
            $this->em->flush();
        } catch (\Exception $e) {
            throw new BadRequestHttpException('Nastala chyba při aktualizaci zápasu');
        }

        $json = $this->serializer->serialize($match, 'json', ['groups' => ['match:read']]);

        return JsonResponse::fromJsonString($json, JsonResponse::HTTP_OK);
    }

    #[Route('/{id}/ticketing', name: 'full_match_stats', methods: ['GET'], requirements: ['id' => '\d+'])]
    #[IsGranted('ROLE_USER')]
    /**
     * Get match details with purchase history for the ticketing page.
     *
     * @param GameRepository $gameRepository The repository to fetch the last active match.
     * @param SerializerInterface $serializer The serializer to format the response.
     *
     * @return JsonResponse
     */
    public function getTicketingDetail(Game $match): JsonResponse
    {
        /** @var User $authUser */
        $authUser = $this->getUser();

        $entrance = $authUser->getEntrance();
        if (!$entrance) {
            throw new BadRequestHttpException('Uživatel nemá přiřazený vstup');
        }

        $matchData = $this->gameRepository->findWithFilteredPurchases($match->getId(), $entrance->getId());

        if (!$matchData) {
            throw new NotFoundHttpException('Zápas nenalezen');
        }

        $result = $this->serializer->serialize($matchData, 'json', [
            'groups' => ['game:admin_dashboard', 'purchase:admin_game_summary'],
            'circular_reference_handler' => function ($object) {
                return $object->getId();
            },
        ]);

        return JsonResponse::fromJsonString($result, JsonResponse::HTTP_OK);
    }

    #[Route('/{id}/dashboard', name: 'dashboard', methods: ['GET'], requirements: ['id' => '\d+'])]
    #[IsGranted('ROLE_ADMIN')]
    public function getFullMatchDashboardStats(Game $match): JsonResponse
    {
        $statsData = $this->gameRepository->getMatchStatistics($match->getId());

        $totalEarnings = 0;
        $fullTicketsCount = 0;
        $halfTicketsCount = 0;
        $fullTicketsEarnings = 0;
        $halfTicketsEarnings = 0;
        $paymentMethodStats = ['cash' => 0, 'qr' => 0];

        $entranceData = [];
        foreach ($statsData['entranceBreakdown'] as $row) {
            $eName = $row['entranceName'];
            if (!isset($entranceData[$eName])) {
                $entranceData[$eName] = [
                    'name' => $eName,
                    'totalEarnings' => 0,
                    'totalTickets' => 0,
                    'fullTicketsCount' => 0,
                    'fullTicketsEarnings' => 0,
                    'halfTicketsCount' => 0,
                    'halfTicketsEarnings' => 0,
                    'paymentMethods' => ['cash' => 0, 'qr' => 0]
                ];
            }
            $earnings = (float) $row['earnings'];
            $ticketCount = (int) $row['ticketCount'];
            $paymentType = $row['paymentType'];

            $entranceData[$eName]['totalEarnings'] += $earnings;
            $entranceData[$eName]['totalTickets'] += $ticketCount;
            $totalEarnings += $earnings;
            $paymentMethodStats[$paymentType] += $earnings;

            if ($row['ticketTypeName'] === 'fullTicket') {
                $entranceData[$eName]['fullTicketsCount'] += $ticketCount;
                $entranceData[$eName]['fullTicketsEarnings'] += $earnings;
                $fullTicketsCount += $ticketCount;
                $fullTicketsEarnings += $earnings;
            } else { // halfTicket
                $entranceData[$eName]['halfTicketsCount'] += $ticketCount;
                $entranceData[$eName]['halfTicketsEarnings'] += $earnings;
                $halfTicketsCount += $ticketCount;
                $halfTicketsEarnings += $earnings;
            }
        }

        foreach ($entranceData as &$e) {
            $e['totalEarnings'] = $e['totalEarnings'];
            $e['fullTicketsEarnings'] = $e['fullTicketsEarnings'];
            $e['halfTicketsEarnings'] = $e['halfTicketsEarnings'];
            $e['paymentMethods']['cash'] = $e['paymentMethods']['cash'];
            $e['paymentMethods']['qr'] = $e['paymentMethods']['qr'];
        }

        $paymentMethodChartData = [
            ['name' => 'Hotovost', 'value' => $paymentMethodStats['cash']],
            ['name' => 'QR', 'value' => $paymentMethodStats['qr']]
        ];

        $dto = new MatchStatisticsDto(
            match: $match,
            totalEarnings: $totalEarnings,
            totalTickets: $fullTicketsCount + $halfTicketsCount,
            fullTicketsCount: $fullTicketsCount,
            fullTicketsEarnings: $fullTicketsEarnings,
            halfTicketsCount: $halfTicketsCount,
            halfTicketsEarnings: $halfTicketsEarnings,
            salesOverTime: $statsData['salesOverTime'],
            entrancesStats: array_values($entranceData),
            paymentMethodStats: $paymentMethodChartData,
            seasonAverages: $statsData['seasonAverages']

        );

        return $this->json($dto, context: ['groups' => ['match:stats']]);
    }
}
