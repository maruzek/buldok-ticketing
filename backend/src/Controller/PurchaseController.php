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
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api/purchase', name: 'purchase_')]
final class PurchaseController extends AbstractController
{
    #[Route('/mark', name: 'mark', methods: ['POST'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    /**
     * Mark a purchase for a match.
     *
     * @param Request $request The request containing the purchase data.
     * @param TicketTypeRepository $ticketTypeRepository Repository to fetch ticket types.
     * @param EntityManagerInterface $em The entity manager to persist the purchase.
     * @param GameRepository $gameRepository Repository to fetch game details.
     * @param PurchaseRepository $purchaseRepository Repository to fetch purchases.
     * @param SerializerInterface $serializer Serializer to convert purchase data to JSON.
     *
     * @return JsonResponse
     */
    public function mark(
        Request $request,
        TicketTypeRepository $ticketTypeRepository,
        EntityManagerInterface $em,
        GameRepository $gameRepository,
        PurchaseRepository $purchaseRepository,
        SerializerInterface $serializer
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            return $this->json([
                'error' => 'Invalid JSON',
            ], JsonResponse::HTTP_BAD_REQUEST);
        }

        /** @var User|null $authUser */
        $authUser = $this->getUser();

        if (!$authUser || !$authUser->getEntrance()) {
            return $this->json(['error' => 'Uživatel nenalezen nebo nemá definovaný vchod'], Response::HTTP_UNAUTHORIZED);
        }

        $fullTicketsCount = $data['fullTickets'] ?? 0;
        $halfTicketsCount = $data['halfTickets'] ?? 0;

        $purchase = new Purchase();
        $purchase->setEntrance($authUser->getEntrance());
        $purchase->setMatch($gameRepository->findOneBy(['id' => $data['matchID']]));
        $purchase->setPurchasedAt(new \DateTimeImmutable());
        $purchase->setSoldBy($authUser);

        if ($fullTicketsCount > 0) {
            $fullTicketItems = new PurchaseItem();
            $fullTicketItems->setTicketType($ticketTypeRepository->findOneBy(['name' => 'fullTicket']));
            $fullTicketItems->setPriceAtPurchase((float)$ticketTypeRepository->findOneBy(['name' => 'fullTicket'])->getPrice() * $data['fullTickets']);
            $fullTicketItems->setQuantity($data['fullTickets']);
            $fullTicketItems->setPurchaseId($purchase);

            $purchase->addPurchaseItem($fullTicketItems);
        }

        if ($halfTicketsCount > 0) {
            $halfTicketItems = new PurchaseItem();
            $halfTicketItems->setTicketType($ticketTypeRepository->findOneBy(['name' => 'halfTicket']));
            $halfTicketItems->setPriceAtPurchase((float)$ticketTypeRepository->findOneBy(['name' => 'halfTicket'])->getPrice() * $data['halfTickets']);
            $halfTicketItems->setQuantity($data['halfTickets']);
            $halfTicketItems->setPurchaseId($purchase);

            $purchase->addPurchaseItem($halfTicketItems);
        }

        try {
            if ($fullTicketsCount > 0) {
                $em->persist($fullTicketItems);
            }
            if ($halfTicketsCount > 0) {
                $em->persist($halfTicketItems);
            }
            $em->persist($purchase);
            $em->flush();
        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Failed to create purchase',
                'message' => $e->getMessage(),
            ], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }


        $newPurchase = $purchaseRepository->findLastPurchaseWithDetailsByMatchAndEntrance($gameRepository->findOneBy(['id' => $data['matchID']]), $authUser->getEntrance());

        $jsonContent = $serializer->serialize($newPurchase, 'json', [
            'groups' => ['purchase:read', 'purchase_item:read'],
            'circular_reference_handler' => function ($object) {
                return $object->getId();
            },
        ]);

        return JsonResponse::fromJsonString($jsonContent);
    }

    #[Route('/match/{id}/all', name: 'match', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    /**
     * Get all purchases for a specific match.
     *
     * @param GameRepository $gameRepository The repository to fetch game details.
     * @param int $id The ID of the match.
     * @param PurchaseRepository $purchaseRepository The repository to fetch purchases.
     * @param SerializerInterface $serializer Serializer to convert purchase data to JSON.
     *
     * @return JsonResponse
     */
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

        /** @var User|null $authUser */
        $authUser = $this->getUser();

        if (!$authUser || !$authUser->getEntrance()) {
            return $this->json(['error' => 'Uživatel nenalezen nebo nemá definovaný vchod'], Response::HTTP_UNAUTHORIZED);
        }

        $purchasesWithDetails = $purchaseRepository->findPurchasesWithDetailsByMatchAndEntrance($match, $authUser->getEntrance());

        $jsonContent = $serializer->serialize($purchasesWithDetails, 'json', [
            'groups' => ['purchase:read', 'purchase_item:read'],
            'circular_reference_handler' => function ($object) {
                return $object->getId();
            },
        ]);

        return JsonResponse::fromJsonString($jsonContent);
    }

    #[Route('/{id}', name: 'delete', methods: ['DELETE'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    /**
     * Delete a purchase by its ID.
     *
     * @param PurchaseRepository $purchaseRepository The repository to fetch the purchase.
     * @param int $id The ID of the purchase to delete.
     * @param EntityManagerInterface $em The entity manager to handle the deletion.
     *
     * @return JsonResponse
     */
    public function deletePurchase(
        PurchaseRepository $purchaseRepository,
        int $id,
        EntityManagerInterface $em
    ): JsonResponse {
        $purchase = $purchaseRepository->find($id);

        if (!$purchase) {
            return $this->json([
                'error' => 'Purchase not found',
            ], Response::HTTP_NOT_FOUND);
        }

        try {
            $em->remove($purchase);
            $em->flush();
        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Failed to delete purchase',
                'message' => $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        return $this->json([
            'message' => 'Nákup byl úspěšně smazán',
        ], Response::HTTP_OK);
    }
}
