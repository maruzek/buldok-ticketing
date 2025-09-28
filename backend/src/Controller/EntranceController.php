<?php

namespace App\Controller;

use App\Entity\Entrance;
use App\Repository\EntranceRepository;
use Doctrine\ORM\EntityManagerInterface;
use Exception;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api/admin/entrances', name: 'api_entrance_')]
final class EntranceController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly SerializerInterface $serializer
    ) {}

    #[Route('/create', name: 'create', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    /**
     * Create a new entrance.
     *
     * @param Request $request The request containing the entrance data.
     * @param EntityManagerInterface $em The entity manager to persist the new entrance.
     *
     * @return JsonResponse
     */
    public function index(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new BadRequestHttpException('Invalid JSON');
        }

        if (!$data['name']) {
            throw new BadRequestHttpException('Name is required');
        }

        if ($em->getRepository(Entrance::class)->findOneBy(['name' => $data['name']])) {
            throw new BadRequestHttpException('Entrance with this name already exists');
        }

        $entrance = new Entrance();

        $entrance->setName($data['name']);
        $entrance->setLocation($data['location'] ?? null);

        try {
            $em->persist($entrance);
            $em->flush();
        } catch (\Exception $e) {
            throw new Exception('Failed to create entrance', 500);
        }

        $json = $this->serializer->serialize($entrance, 'json', [
            'groups' => ['entrance:read'],
            'circular_reference_handler' => function ($object) {
                return $object->getId();
            },
        ]);

        return JsonResponse::fromJsonString($json, JsonResponse::HTTP_CREATED);
    }

    #[Route('/', name: 'list_all', methods: ['GET'])]
    #[IsGranted('ROLE_ADMIN')]
    /**
     * Get all entrances with their users.
     *
     * @param EntranceRepository $entranceRepository The repository to fetch entrances.
     *
     * @return JsonResponse
     */
    public function all(EntranceRepository $entranceRepository): JsonResponse
    {
        $entrances = $entranceRepository->findAll();

        $json = $this->serializer->serialize($entrances, 'json', [
            'groups' => ['entrance:read'],
            'circular_reference_handler' => function ($object) {
                return $object->getId();
            },
        ]);

        return JsonResponse::fromJsonString($json, JsonResponse::HTTP_OK);
    }


    #[Route('/{id}', name: 'get_by_id', methods: ['GET'])]
    #[IsGranted('ROLE_ADMIN')]
    /**
     * Get an entrance by its ID.
     *
     * @param int $id The ID of the entrance to retrieve.
     * @param EntranceRepository $entranceRepository The repository to fetch the entrance.
     *
     * @return JsonResponse
     */
    public function getById(int $id, EntranceRepository $entranceRepository): JsonResponse
    {
        $entrance = $entranceRepository->findOneBy(['id' => $id]);

        if (!$entrance) {
            return $this->json([
                'error' => 'Entrance not found',
            ], JsonResponse::HTTP_NOT_FOUND);
        }

        $users = [];

        $json = $this->serializer->serialize($entrance, 'json', [
            'groups' => ['entrance:read'],
            'circular_reference_handler' => function ($object) {
                return $object->getId();
            },
        ]);

        return JsonResponse::fromJsonString($json, JsonResponse::HTTP_OK);
    }

    #[Route('/{id}', name: 'edit_by_id', methods: ['PUT'])]
    #[IsGranted('ROLE_ADMIN')]
    /**
     * Edit an entrance by its ID.
     *
     * @param int $id The ID of the entrance to edit.
     * @param EntranceRepository $entranceRepository The repository to fetch the entrance.
     * @param Request $request The request containing the new data.
     * @param EntityManagerInterface $em The entity manager to persist changes.
     *
     * @return JsonResponse
     */
    public function editById(Entrance $entrance, int $id, EntranceRepository $entranceRepository, Request $request, EntityManagerInterface $em): JsonResponse
    {
        if (!$entrance) {
            throw new NotFoundHttpException('Entrance not found');
        }

        $data = json_decode($request->getContent(), true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new BadRequestHttpException('Invalid JSON');
        }

        $entrance->setName($data['name'] ?? $entrance->getName());
        $entrance->setLocation($data['location'] ?? $entrance->getLocation());

        try {
            $em->flush();
        } catch (\Exception $e) {
            throw new Exception('Failed to update entrance', 500);
        }

        $json = $this->serializer->serialize($entrance, 'json', [
            'groups' => ['entrance:read'],
            'circular_reference_handler' => function ($object) {
                return $object->getId();
            },
        ]);

        return JsonResponse::fromJsonString($json, JsonResponse::HTTP_OK);
    }
}
