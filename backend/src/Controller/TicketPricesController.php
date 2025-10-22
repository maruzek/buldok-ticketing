<?php

namespace App\Controller;

use App\Entity\TicketType;
use App\Repository\TicketTypeRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Exception\BadRequestException;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/ticket-prices', name: 'api_ticket_prices_')]
final class TicketPricesController extends AbstractController
{
    #[Route('/', name: 'get', methods: ['GET'])]
    /**
     * Get the current ticket prices.
     *
     * @param TicketTypeRepository $ticketTypeRepository Repository to fetch ticket types.
     * @param EntityManagerInterface $em The entity manager to handle database operations.
     *
     * @return JsonResponse
     */
    public function get(TicketTypeRepository $ticketTypeRepository, EntityManagerInterface $em): JsonResponse
    {
        $fullTicket = $ticketTypeRepository->findOneBy(['name' => 'fullTicket']);
        $halfTicket = $ticketTypeRepository->findOneBy(['name' => 'halfTicket']);

        if (!$fullTicket || !$halfTicket) {
            throw new NotFoundHttpException('Ceny vstupenek nebyly nastaveny. Prosím, nastavte je před používáním aplikace a jejich zobrazením.');
        }

        return $this->json([
            'fullTicket' => $fullTicket->getPrice(),
            'halfTicket' => $halfTicket->getPrice(),
        ], 200);
    }

    #[Route('/', name: 'update', methods: ['PUT'])]
    #[IsGranted('ROLE_ADMIN')]
    /**
     * Update the ticket prices.
     *
     * @param TicketTypeRepository $ticketTypeRepository Repository to fetch ticket types.
     * @param EntityManagerInterface $em The entity manager to handle database operations.
     * @param Request $request The request containing the new prices.
     *
     * @return JsonResponse
     */
    public function update(TicketTypeRepository $ticketTypeRepository, EntityManagerInterface $em, Request $request): JsonResponse
    {
        $fullTicket = $ticketTypeRepository->findOneBy(['name' => 'fullTicket']);
        $halfTicket = $ticketTypeRepository->findOneBy(['name' => 'halfTicket']);

        $data = json_decode($request->getContent(), true);

        if (!isset($data['fullTicket']) && !isset($data['halfTicket'])) {
            throw new BadRequestException('Musíte zadat obě ceny k aktualizaci');
        }

        if (!isset($data['fullTicket'])) {
            throw new BadRequestException('Plná cena je povinná');
        }

        if (!isset($data['halfTicket'])) {
            throw new BadRequestException('Poloviční cena je povinná');
        }

        if (!is_numeric($data['fullTicket']) || $data['fullTicket'] < 0) {
            throw new BadRequestException('Plná cena musí být nezáporné číslo');
        }

        if (!is_numeric($data['halfTicket']) || $data['halfTicket'] < 0) {
            throw new BadRequestException('Poloviční cena musí být nezáporné číslo');
        }

        if (!$fullTicket || !$halfTicket) {
            $fullTicket = new TicketType();
            $fullTicket->setName('fullTicket');
            $fullTicket->setPrice((float)$data['fullTicket'] ?? 0);
            $halfTicket = new TicketType();
            $halfTicket->setName('halfTicket');
            $halfTicket->setPrice((float)$data['halfTicket'] ?? 0);

            $em->persist($fullTicket);
            $em->persist($halfTicket);
            $em->flush();

            return $this->json([
                'message' => 'Ceny vytvořeny, nyní je můžete aktualizovat',
                'fullTicket' => $fullTicket->getPrice(),
                'halfTicket' => $halfTicket->getPrice(),
            ], 201);
        }

        try {
            $fullTicket->setPrice((float)$data['fullTicket']);
            $halfTicket->setPrice((float)$data['halfTicket']);
            $em->flush();
        } catch (\Exception $e) {
            throw new BadRequestException('Chyba při aktualizaci cen');
        }

        return $this->json([
            'status' => 'ok',
            'message' => 'Ceny úspěšně aktualizovány',
        ], 200);
    }
}
