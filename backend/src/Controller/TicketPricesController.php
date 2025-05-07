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
        $fullTicket = $ticketTypeRepository->findOneBy(['name' => 'fullTicketPrice']);
        $halfTicket = $ticketTypeRepository->findOneBy(['name' => 'halfTicketPrice']);

        return $this->json([
            'fullTicketPrice' => $fullTicket->getPrice(),
            'halfTicketPrice' => $halfTicket->getPrice(),
        ], 200);
    }

    #[Route('/', name: 'update', methods: ['PUT'])]
    public function update(TicketTypeRepository $ticketTypeRepository, EntityManagerInterface $em, Request $request): JsonResponse
    {
        $fullTicket = $ticketTypeRepository->findOneBy(['name' => 'fullTicketPrice']);
        $halfTicket = $ticketTypeRepository->findOneBy(['name' => 'halfTicketPrice']);

        $data = json_decode($request->getContent(), true);

        if (!isset($data['fullTicketPrice'])) {
            return $this->json([
                'message' => 'fullTicketPrice is required',
            ], 400);
        }
        if (!isset($data['halfTicketPrice'])) {
            return $this->json([
                'message' => 'halfTicketPrice is required',
            ], 400);
        }

        try {
            $fullTicket->setPrice((float)$data['fullTicketPrice']);
            $halfTicket->setPrice((float)$data['halfTicketPrice']);
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
