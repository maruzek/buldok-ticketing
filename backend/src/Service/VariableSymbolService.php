<?php

namespace App\Service;

use Doctrine\ORM\EntityManagerInterface;
use App\Repository\PaymentRepository;

class VariableSymbolService
{
    public function __construct(private PaymentRepository $paymentRepository) {}

    public function generateUnique(): int
    {
        do {
            $timestampPart = substr((string)time(), -8);
            $randomPart = random_int(10, 99);
            $vs = (int)($timestampPart . $randomPart);

            $exists = $this->paymentRepository->find($vs) !== null;
        } while ($exists);

        return $vs;
    }
}
