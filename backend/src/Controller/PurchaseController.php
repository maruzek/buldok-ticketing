<?php

namespace App\Controller;

use App\Entity\Game;
use App\Entity\Purchase;
use App\Entity\PurchaseItem;
use App\Entity\User;
use App\Enum\PurchaseStatus;
use App\Repository\GameRepository;
use App\Repository\PurchaseRepository;
use App\Repository\TicketTypeRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Exception\BadRequestException;
use Symfony\Component\HttpFoundation\File\Exception\AccessDeniedException;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api/v1/purchases', name: 'api_v1_purchases_')]
final class PurchaseController extends AbstractController
{
    public function __construct(
        private TicketTypeRepository $ticketTypeRepository,
        private EntityManagerInterface $em,
        private GameRepository $gameRepository,
        private PurchaseRepository $purchaseRepository,
        private SerializerInterface $serializer
    ) {}

    #[Route('/', name: 'create', methods: ['POST'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    /**
     * Mark a purchase for a match.
     *
     * @param Request $request The request containing the purchase data.
     *
     * @return JsonResponse
     */
    public function create(
        Request $request
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new BadRequestException('Neplatná data');
        }

        /** @var User|null $authUser */
        $authUser = $this->getUser();

        if (!$authUser || !$authUser->getEntrance()) {
            throw new AccessDeniedException('Uživatel nenalezen nebo nemá definovaný vchod');
        }

        $fullTicketsCount = $data['fullTickets'] ?? 0;
        $halfTicketsCount = $data['halfTickets'] ?? 0;

        if ($fullTicketsCount + $halfTicketsCount <= 0) {
            throw new BadRequestException('Musí být zakoupen alespoň jeden lístek');
        }

        $purchase = new Purchase();
        $purchase->setEntrance($authUser->getEntrance());
        $purchase->setMatch($this->gameRepository->findOneBy(['id' => $data['matchID']]));
        $purchase->setPurchasedAt(new \DateTimeImmutable());
        $purchase->setSoldBy($authUser);
        $purchase->setPaymentType($data['paymentType'] ?? 'cash');

        if ($fullTicketsCount > 0) {
            $fullTicketItems = new PurchaseItem();
            $fullTicketItems->setTicketType($this->ticketTypeRepository->findOneBy(['name' => 'fullTicket']));
            $fullTicketItems->setPriceAtPurchase((float)$this->ticketTypeRepository->findOneBy(['name' => 'fullTicket'])->getPrice() * $data['fullTickets']);
            $fullTicketItems->setQuantity($data['fullTickets']);
            $fullTicketItems->setPurchaseId($purchase);

            $purchase->addPurchaseItem($fullTicketItems);
        }

        if ($halfTicketsCount > 0) {
            $halfTicketItems = new PurchaseItem();
            $halfTicketItems->setTicketType($this->ticketTypeRepository->findOneBy(['name' => 'halfTicket']));
            $halfTicketItems->setPriceAtPurchase((float)$this->ticketTypeRepository->findOneBy(['name' => 'halfTicket'])->getPrice() * $data['halfTickets']);
            $halfTicketItems->setQuantity($data['halfTickets']);
            $halfTicketItems->setPurchaseId($purchase);

            $purchase->addPurchaseItem($halfTicketItems);
        }

        try {
            if ($fullTicketsCount > 0) {
                $this->em->persist($fullTicketItems);
            }
            if ($halfTicketsCount > 0) {
                $this->em->persist($halfTicketItems);
            }
            $this->em->persist($purchase);
            $this->em->flush();
        } catch (\Exception $e) {
            throw new \RuntimeException('Nastala chyba při vytváření nákupu: ' . $e->getMessage());
        }
        //  todo why?
        $newPurchase = $this->purchaseRepository->findLastPurchaseWithDetailsByMatchAndEntrance($this->gameRepository->findOneBy(['id' => $data['matchID']]), $authUser->getEntrance());

        $jsonContent = $this->serializer->serialize($newPurchase, 'json', [
            'groups' => ['purchase:read', 'purchase_item:read'],
            'circular_reference_handler' => function ($object) {
                return $object->getId();
            },
        ]);

        return JsonResponse::fromJsonString($jsonContent);
    }

    #[Route('/{id}', name: 'delete', methods: ['DELETE'],  requirements: ['id' => '\d+'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    /**
     * Delete a purchase by its ID.
     *
     * @param Purchase $purchase The purchase entity to be deleted.
     *
     * @return JsonResponse
     */
    public function deletePurchase(
        Purchase $purchase,
    ): JsonResponse {
        $purchase->setStatus(PurchaseStatus::REMOVED);
        try {
            $this->em->persist($purchase);
            $this->em->flush();
        } catch (\Exception $e) {
            throw new \Exception('Nastala chyba při mazání nákupu: ' . $e->getMessage(), 500);
        }

        return $this->json([
            'message' => 'Nákup byl úspěšně smazán',
        ], Response::HTTP_OK);
    }
}
