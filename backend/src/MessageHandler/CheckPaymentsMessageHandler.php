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
use App\Entity\Payment;

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
        // $conn = $this->entityManager->getConnection();
        // try {
        //     $conn->executeQuery('SELECT 1');
        // } catch (\Throwable $e) {
        //     $this->logger->warning('HANDLER: Lost DB connection, reconnecting...', ['exception' => $e->getMessage()]);
        //     $conn->close();
        //     $conn->connect();
        // }

        $this->logger->info('HANDLER: Checking for new Fio transactions...');

        $transactions = $this->fioApi->fetchNewTransactions();

        if (empty($transactions)) {
            $this->logger->info('HANDLER: No new transactions found.');
            return;
        }

        foreach ($transactions as $transaction) {
            // column5 = Variabilní symbol (VS)
            $variableSymbol = $transaction['column5']['value'] ?? null;
            // column1 = Objem (Amount)
            $amount = $transaction['column1']['value'] ?? null;
            // column22 = ID pohybu
            $transactionId = $transaction['column22']['value'];

            if ($variableSymbol === null || $amount === null || $amount <= 0) {
                continue;
            }

            $this->logger->info('HANDLER: Processing transaction.', [
                'id' => $transactionId,
                'vs' => $variableSymbol,
                'amount' => $amount
            ]);

            /** @var Payment|null $payment */
            $payment = $this->paymentRepository->findOneBy([
                'variableSymbol' => (int)$variableSymbol,
                // 'amount' => (float)$amount,
                'status' => 'pending'
            ]);

            if (! $payment) {
                continue;
            }

            $expected = (float) $payment->getAmount();
            $actual   = (float) $amount;

            if (abs($expected - $actual) > 0.001) {
                $this->logger->warning('HANDLER: Amount mismatch for VS, marking failed', [
                    'vs'       => $variableSymbol,
                    'expected' => $expected,
                    'actual'   => $actual,
                ]);
                // TODO: Bude lepší payment uchovat, označit jako failed a smazat jen purchase případně ten taky nechat a označit jako cancelled?
                // Teď se smaže i purchase, protože je to kaskádově.
                $this->entityManager->remove($payment->getPurchase());
                $this->entityManager->flush();

                $topic  = 'https://buldok.app/payments/' . $payment->getVariableSymbol();
                $update = new Update($topic, json_encode(['status' => 'failed', 'reason' => 'amount_mismatch']));
                $this->hub->publish($update);

                $this->logger->info('HANDLER: Published Mercure update. Amount mismatch.', ['topic' => $topic]);

                continue;
            }

            $this->logger->info('HANDLER: Found matching payment in DB!', ['payment_id' => $payment->getId()]);

            $payment->setStatus('paid');
            $payment->setPaidAt(new \DateTimeImmutable());
            $this->entityManager->flush();

            $topic = 'https://buldok.app/payments/' . $payment->getVariableSymbol();
            $update = new Update(
                $topic,
                json_encode(['status' => 'completed'])
            );
            $this->hub->publish($update);

            $this->logger->info('HANDLER: Published Mercure update. Payment successful.', ['topic' => $topic]);
        }
    }
}
