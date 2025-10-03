<?php

namespace App\Controller;

use App\Entity\Season;
use App\Enum\SeasonStatus;
use App\Repository\SeasonRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Exception\BadRequestException;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api/season', name: 'api_')]
#[IsGranted('ROLE_ADMIN')]
final class SeasonController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly SerializerInterface $serializer,
        private readonly SeasonRepository $seasonRepository,
    ) {}

    #[Route('/', name: 'create_season', methods: ['POST'])]
    public function createSeason(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new BadRequestException('Invalid JSON data');
        }

        if (empty($data['years']) || empty($data['startAt']) || empty($data['endAt'])) {
            throw new BadRequestException('Missing required fields');
        }
        // check if startDate is before endDate
        // check if the season with the same name already exists
        // check if first year is less than the second by one year

        $newStartAt = new \DateTime($data['startAt']);
        $newEndAt = new \DateTime($data['endAt']);


        if ($newStartAt >= $newEndAt) {
            throw new BadRequestException('Start date must be before end date');
        }

        $overlappingSeasons = $this->seasonRepository->findOverlappingSeasons($newStartAt, $newEndAt);
        if (count($overlappingSeasons) > 0) {
            throw new BadRequestException('The provided date range overlaps with an existing season');
        }

        if (strlen($data['years']) !== 9 || !preg_match('/^\d{4}\/\d{4}$/', $data['years'])) {
            throw new BadRequestException('Season name must be in format YYYY/YYYY');
        }

        [$firstYear, $secondYear] = explode('/', $data['years']);
        if ((int)$secondYear !== (int)$firstYear + 1) {
            throw new BadRequestException('The second year must be the first year plus one');
        }

        if ($this->seasonRepository->findOneBy(['years' => $data['years']])) {
            throw new BadRequestException('Season in those years already exists');
        }

        $season = new Season();
        $season->setYears($data['years']);
        $season->setStartAt(new \DateTime($data['startAt']));
        $season->setEndAt(new \DateTime($data['endAt']));

        try {
            $this->em->persist($season);
            $this->em->flush();
        } catch (\Exception $e) {
            throw new \RuntimeException('Failed to create season: ' . $e->getMessage());
        }

        $json = $this->serializer->serialize($season, 'json', ['groups' => 'season:read']);
        return JsonResponse::fromJsonString($json, JsonResponse::HTTP_CREATED);
    }

    #[Route('/', name: 'list_seasons', methods: ['GET'])]
    public function listSeasons(): JsonResponse
    {
        $seasons = $this->seasonRepository->findBy([], ['startAt' => 'DESC']);
        $json = $this->serializer->serialize($seasons, 'json', ['groups' => 'season:read']);
        return JsonResponse::fromJsonString($json);
    }

    #[Route('/current', name: 'get_current_season_data', methods: ['GET'])]
    public function getCurrentSeasonData(): JsonResponse
    {
        $currentDate = new \DateTimeImmutable();
        $season = $this->seasonRepository->findSeasonByDate($currentDate);

        if ($season === null) {
            throw new NotFoundHttpException('No active season found for the current date');
        }

        $dashData = $this->seasonRepository->getDashboardStats($season->getId());

        $json = $this->serializer->serialize($dashData, 'json', ['groups' => 'season:read']);
        return JsonResponse::fromJsonString($json);
    }

    #[Route('/{id}', name: 'get_season_by_id', methods: ['GET'])]
    public function getSeasonById(Season $season): JsonResponse
    {
        $json = $this->serializer->serialize($season, 'json', ['groups' => 'season:read']);
        return JsonResponse::fromJsonString($json);
    }

    #[Route('/{id}', name: 'edit_season', methods: ['PUT'])]
    public function editSeason(Season $season, Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new BadRequestException('Invalid JSON data');
        }

        if (empty($data['years']) || empty($data['startAt']) || empty($data['endAt'])) {
            throw new BadRequestException('Missing required fields');
        }

        $newStartAt = new \DateTime($data['startAt']);
        $newEndAt = new \DateTime($data['endAt']);

        if ($newStartAt >= $newEndAt) {
            throw new BadRequestException('Start date must be before end date');
        }

        $overlappingSeasons = $this->seasonRepository->findOverlappingSeasons($newStartAt, $newEndAt);
        foreach ($overlappingSeasons as $overlappingSeason) {
            if ($overlappingSeason->getId() !== $season->getId()) {
                throw new BadRequestException('The provided date range overlaps with an existing season');
            }
        }

        if (strlen($data['years']) !== 9 || !preg_match('/^\d{4}\/\d{4}$/', $data['years'])) {
            throw new BadRequestException('Season name must be in format YYYY/YYYY');
        }

        [$firstYear, $secondYear] = explode('/', $data['years']);
        if ((int)$secondYear !== (int)$firstYear + 1) {
            throw new BadRequestException('The second year must be the first year plus one');
        }

        $existingSeason = $this->seasonRepository->findOneBy(['years' => $data['years']]);
        if ($existingSeason && $existingSeason->getId() !== $season->getId()) {
            throw new BadRequestException('Season in those years already exists');
        }

        if (SeasonStatus::tryFrom($data['status']) === null) {
            throw new BadRequestException('Invalid status value');
        }

        $season->setYears($data['years']);
        $season->setStartAt(new \DateTime($data['startAt']));
        $season->setEndAt(new \DateTime($data['endAt']));
        $season->setStatus(SeasonStatus::from($data['status']));

        try {
            $this->em->flush();
        } catch (\Exception $e) {
            throw new \RuntimeException('Failed to update season: ' . $e->getMessage());
        }

        $json = $this->serializer->serialize($season, 'json', ['groups' => 'season:read']);
        return JsonResponse::fromJsonString($json);
    }

    #[Route('/{id}/dash-stats', name: 'season_dashboard_stats', methods: ['GET'])]
    public function getDashboardStats(int $id, SeasonRepository $seasonRepository): JsonResponse
    {
        $dashboardData = $seasonRepository->getDashboardStats($id);

        if ($dashboardData === null) {
            throw new NotFoundHttpException('Season not found');
        }

        $json = $this->serializer->serialize($dashboardData, 'json', [
            'groups' => ['season:read', 'match:read', 'game:admin_dashboard'],
            'circular_reference_handler' => function ($object) {
                return $object->getId();
            },
        ]);

        return JsonResponse::fromJsonString($json);
    }
}
