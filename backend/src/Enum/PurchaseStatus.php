<?php

namespace App\Enum;

enum PurchaseStatus: string
{
    case COMPLETED = 'completed';
    case REMOVED = 'removed';

    public function getLabel(): string
    {
        return match ($this) {
            self::COMPLETED => 'Dokončený',
            self::REMOVED => 'Smazaný',
        };
    }
}
