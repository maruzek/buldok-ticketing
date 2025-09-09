<?php

namespace App\MessageHandler;

use App\Message\CheckPaymentsMessage;
use App\Repository\PaymentRepository;
use App\Service\FioApiService;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Mercure\HubInterface;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;
use Symfony\Component\Mercure\Update;

#[AsMessageHandler]
final class CheckPaymentsMessageHandler
{
    public function __construct(
        private FioApiService $fioApi,
        private PaymentRepository $paymentRepository,
        private EntityManagerInterface $entityManager,
        private HubInterface $hub, // <-- Add this
        private LoggerInterface $logger
    ) {}
    public function __invoke(CheckPaymentsMessage $message): void
    {
        $this->logger->info('HANDLER: Checking for new Fio transactions...');

        $transactions = $this->fioApi->fetchNewTransactions();

        if (empty($transactions)) {
            $this->logger->info('HANDLER: No new transactions found.');
            return;
        }

        foreach ($transactions as $transaction) {
            // The JSON structure uses "columnX" keys (see page 26 of docs)
            // column5 = Variabilní symbol (VS)
            $variableSymbol = $transaction['column5']['value'] ?? null;
            // column1 = Objem (Amount)
            $amount = $transaction['column1']['value'] ?? null;
            // column22 = ID pohybu
            $transactionId = $transaction['column22']['value'];

            if ($variableSymbol === null || $amount === null || $amount <= 0) {
                // We only care about incoming payments with a variable symbol
                continue;
            }

            $this->logger->info('HANDLER: Processing transaction.', [
                'id' => $transactionId,
                'vs' => $variableSymbol,
                'amount' => $amount
            ]);

            // Find a PENDING payment in our database that matches the VS and amount
            $payment = $this->paymentRepository->findOneBy([
                'id' => (int)$variableSymbol,
                'amount' => (float)$amount,
                'status' => 'pending'
            ]);

            if ($payment) {
                // WE FOUND A MATCH!
                $this->logger->info('HANDLER: Found matching payment in DB!', ['payment_id' => $payment->getId()]);

                // 1. Update the payment status in the database
                $payment->setStatus('paid');
                $this->entityManager->flush();

                // 2. Publish a real-time update via Mercure
                $topic = 'https://my-ticketing-app.com/payments/' . $payment->getId();
                $update = new Update(
                    $topic,
                    json_encode(['status' => 'paid'])
                );
                $this->hub->publish($update);

                $this->logger->info('HANDLER: Published Mercure update.', ['topic' => $topic]);
            }
        }
    }
}
