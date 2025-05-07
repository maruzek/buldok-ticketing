<?php

namespace App\Controller;

use App\Entity\TicketType;
use App\Repository\TicketTypeRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/ticket-prices', name: 'api_ticket_prices_')]
final class TicketPricesController extends AbstractController
{
    #[Route('/', name: 'get', methods: ['GET'])]
    public function get(TicketTypeRepository $ticketTypeRepository, EntityManagerInterface $em): JsonResponse
    {
        $fullTicket = $ticketTypeRepository->findOneBy(['name' => 'fullTicket']);
        $halfTicket = $ticketTypeRepository->findOneBy(['name' => 'halfTicket']);

        if (!$fullTicket || !$halfTicket) {
            return $this->json([
                'message' => 'Ticket types not found',
            ], 404);
        }

        return $this->json([
            'fullTicket' => $fullTicket->getPrice(),
            'halfTicket' => $halfTicket->getPrice(),
        ], 200);
    }

    #[Route('/', name: 'update', methods: ['PUT'])]
    public function update(TicketTypeRepository $ticketTypeRepository, EntityManagerInterface $em, Request $request): JsonResponse
    {
        $fullTicket = $ticketTypeRepository->findOneBy(['name' => 'fullTicket']);
        $halfTicket = $ticketTypeRepository->findOneBy(['name' => 'halfTicket']);

        $data = json_decode($request->getContent(), true);

        if (!isset($data['fullTicket'])) {
            return $this->json([
                'message' => 'fullTicket is required',
            ], 400);
        }
        if (!isset($data['halfTicket'])) {
            return $this->json([
                'message' => 'halfTicketPrice is required',
            ], 400);
        }

        try {
            $fullTicket->setPrice((float)$data['fullTicket']);
            $halfTicket->setPrice((float)$data['halfTicket']);
            $em->flush();
        } catch (\Exception $e) {
            return $this->json([
                'message' => 'Error updating prices',
                'error' => $e->getMessage(),
            ], 500);
        }

        return $this->json([
            'status' => 'ok',
            'message' => 'Ceny úspešně aktualizovány',
        ], 200);
    }
}
