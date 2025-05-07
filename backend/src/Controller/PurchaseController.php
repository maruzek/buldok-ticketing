<?php

namespace App\Controller;

use App\Entity\Game;
use App\Entity\Purchase;
use App\Entity\PurchaseItem;
use App\Entity\User;
use App\Repository\GameRepository;
use App\Repository\PurchaseRepository;
use App\Repository\TicketTypeRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api/purchase', name: 'purchase_')]
final class PurchaseController extends AbstractController
{
    #[Route('/mark', name: 'mark', methods: ['POST'])]
    public function mark(Request $request, TicketTypeRepository $ticketTypeRepository, EntityManagerInterface $em, GameRepository $gameRepository): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            return $this->json([
                'error' => 'Invalid JSON',
            ], JsonResponse::HTTP_BAD_REQUEST);
        }

        /** @var User|null $authUser */
        $authUser = $this->getUser();

        $purchase = new Purchase();
        $purchase->setEntrance($authUser->getEntrance());
        $purchase->setMatch($gameRepository->findOneBy(['id' => $data['matchID']]));
        $purchase->setPurchasedAt(new \DateTimeImmutable());
        $purchase->setSoldBy($authUser);


        $fullTicketItems = new PurchaseItem();
        $fullTicketItems->setTicketType($ticketTypeRepository->findOneBy(['name' => 'fullTicket']));
        $fullTicketItems->setPriceAtPurchase((float)$ticketTypeRepository->findOneBy(['name' => 'fullTicket'])->getPrice() * $data['fullTickets']);
        $fullTicketItems->setQuantity($data['fullTickets']);
        $fullTicketItems->setPurchaseId($purchase);
        $em->persist($fullTicketItems);

        $halfTicketItems = new PurchaseItem();
        $halfTicketItems->setTicketType($ticketTypeRepository->findOneBy(['name' => 'halfTicket']));
        $halfTicketItems->setPriceAtPurchase((float)$ticketTypeRepository->findOneBy(['name' => 'halfTicket'])->getPrice() * $data['halfTickets']);
        $halfTicketItems->setQuantity($data['halfTickets']);
        $halfTicketItems->setPurchaseId($purchase);
        $em->persist($halfTicketItems);

        try {
            $em->persist($purchase);
            $em->flush();
        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Failed to create purchase',
                'message' => $e->getMessage(),
            ], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }


        return $this->json([
            'data' => $data,
        ]);
    }

    #[Route('/match/{id}/all', name: 'match', methods: ['GET'])]
    public function getPurchasesByMatch(
        GameRepository $gameRepository,
        int $id,
        PurchaseRepository $purchaseRepository,
        SerializerInterface $serializer
    ): JsonResponse {
        $match = $gameRepository->findOneBy(['id' => $id]);

        if (!$match) {
            return $this->json([
                'error' => 'Match not found',
            ], Response::HTTP_NOT_FOUND);
        }

        if ($match->getStatus() === 'FINISHED' && !in_array("ROLE_ADMIN", $this->getUser()->getRoles())) {
            return $this->json([
                'error' => 'Match is finished',
            ], Response::HTTP_BAD_REQUEST);
        }

        $purchasesWithDetails = $purchaseRepository->findPurchasesWithDetailsByMatch($match, $this->getUser());

        $jsonContent = $serializer->serialize($purchasesWithDetails, 'json', [
            'circular_reference_handler' => function ($object) {
                return $object->getId();
            },
        ]);

        return JsonResponse::fromJsonString($jsonContent);
    }
}
