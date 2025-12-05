<?php

namespace App\Controller;

use App\Entity\Payment;
use App\Enum\PaymentStatus;
use App\Enum\PurchaseStatus;
use App\Repository\PaymentRepository;
use App\Repository\PurchaseRepository;
use App\Service\FioApiService;
use App\Service\VariableSymbolService;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Exception\BadRequestException;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Mercure\HubInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Mercure\Update;

#[Route('/api/v1/payments', name: 'api_v1_payments_')]
final class PaymentController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly LoggerInterface $logger,
        private readonly PaymentRepository $paymentRepository,
        private readonly HubInterface $hub,
        private readonly PurchaseRepository $purchaseRepository,
        private readonly VariableSymbolService $vsGenerator
    ) {}

    #[Route('', name: 'create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new BadRequestException('Neplatná data');
        }

        if ($data['amount'] <= 0) {
            throw new BadRequestException('Částka musí být větší než nula');
        }

        $purchase = $this->purchaseRepository->find($data['purchaseId'] ?? 0);

        if (!$purchase) {
            throw new NotFoundHttpException('Nákup nenalezen');
        }

        $vs = $this->vsGenerator->generateUnique();

        $payment = new Payment();
        $payment->setAmount($data['amount'] ?? 0);
        $payment->setVariableSymbol($vs);
        $payment->setStatus(PaymentStatus::PENDING);
        $payment->setPaidAt(null);
        $payment->setGeneratedAt(new \DateTimeImmutable());
        $payment->setPurchase($purchase);

        $this->em->persist($payment);
        $this->em->flush();

        return $this->json([
            'message' => 'Platba byla úspěšně zpracována!',
            'vs' => $vs,
            'paymentId' => $payment->getId(),
        ], JsonResponse::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'cancel', methods: ['DELETE'])]
    public function cancel(Payment $payment): JsonResponse
    {
        $paymentId = $payment->getId();
        $payment->setStatus(PaymentStatus::CANCELED);
        $purchase = $payment->getPurchase();
        if ($purchase) {
            $purchase->setStatus(PurchaseStatus::REMOVED);
        }
        $this->em->flush();
        $this->logger->info('Payment canceled', ['payment_id' => $payment->getId()]);

        $topic = 'https://my-ticketing-app.com/payments/' . $paymentId;
        $update = new Update(
            $topic,
            json_encode(['status' => 'canceled'])
        );
        $this->hub->publish($update);

        return $this->json([
            'message' => 'Platba byla zrušena',
            'vs' => $payment->getVariableSymbol(),
            'paymentId' => $paymentId,
        ], JsonResponse::HTTP_OK);
    }
}
