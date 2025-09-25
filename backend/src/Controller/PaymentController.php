<?php

namespace App\Controller;

use App\Entity\Payment;
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

final class PaymentController extends AbstractController
{
    #[Route('/api/payment', name: 'app_payment', methods: ['POST'])]
    public function index(Request $request, VariableSymbolService $vsGenerator, EntityManagerInterface $em, PurchaseRepository $purchaseRepository): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new BadRequestException('Invalid JSON');
        }

        if ($data['amount'] <= 0) {
            throw new BadRequestException('Amount must be greater than zero');
        }

        $purchase = $purchaseRepository->find($data['purchaseId'] ?? 0);

        if (!$purchase) {
            throw new NotFoundHttpException('Purchase not found');
        }

        $vs = $vsGenerator->generateUnique();

        $payment = new Payment();
        $payment->setAmount($data['amount'] ?? 0);
        $payment->setVariableSymbol($vs);
        $payment->setStatus('pending');
        $payment->setPaidAt(null);
        $payment->setGeneratedAt(new \DateTimeImmutable());
        $payment->setPurchase($purchase);

        $em->persist($payment);
        $em->flush();

        return $this->json([
            'message' => 'Payment processed successfully!',
            'vs' => $vs,
        ]);
    }

    #[Route('/api/payment/test', name: 'app_payment_get', methods: ['GET'])]
    public function getTest(EntityManagerInterface $em, FioApiService $fioApiService): JsonResponse
    {
        $result = $fioApiService->fetchNewTransactions();

        return $this->json($result);
    }

    #[Route('/api/payment/test-push', name: 'app_payment_get', methods: ['GET'])]
    public function pushTest(Request $request, EntityManagerInterface $em, HubInterface $hub): JsonResponse
    {
        $paymentId = $request->query->get('vs');
        $payment = $em->getRepository(Payment::class)->findOneBy(["variableSymbol" => $paymentId]);

        if ($payment) {
            $topic = 'https://my-ticketing-app.com/payments/' . $paymentId;
            $update = new Update(
                $topic,
                json_encode(['status' => 'completed'])
            );
            $hub->publish($update);
        }

        return $this->json($paymentId);
    }

    #[Route('/api/payment/cancel', name: 'app_payment_get', methods: ['POST'])]
    public function cancelPayment(Request $request, EntityManagerInterface $em, HubInterface $hub, LoggerInterface $logger, PaymentRepository $paymentRepository): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $paymentId = $data['vs'] ?? null;
        if ($paymentId === null) {
            throw new BadRequestException('Variable symbol (vs) is required');
        }

        /** @var Payment $payment */
        $payment = $paymentRepository->findOneBy(["variableSymbol" => $paymentId]);

        if ($payment) {
            $payment->setStatus('canceled');
            $purchase = $payment->getPurchase();
            if ($purchase) {
                $em->remove($purchase);
            }
            $em->flush();
            $logger->info('Payment canceled', ['payment_id' => $payment->getId()]);

            $topic = 'https://my-ticketing-app.com/payments/' . $paymentId;
            $update = new Update(
                $topic,
                json_encode(['status' => 'canceled'])
            );
            $hub->publish($update);
        }

        return $this->json([
            'message' => 'Payment canceled',
            'vs' => $paymentId,
        ], JsonResponse::HTTP_OK);
    }
}
