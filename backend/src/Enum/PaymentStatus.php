<?php

namespace App\Enum;

enum PaymentStatus: string
{
    case PENDING = 'pending';
    case PAID = 'paid';
    case CANCELED = 'canceled';

    public function getLabel(): string
    {
        return match ($this) {
            self::PENDING => 'Čekající',
            self::PAID => 'Zaplacená',
            self::CANCELED => 'Zrušená',
        };
    }
}
