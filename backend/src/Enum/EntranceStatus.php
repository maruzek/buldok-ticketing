<?php

namespace App\Enum;

enum EntranceStatus: string
{
    case OPENED = 'opened';
    case CLOSED = 'closed';
    case REMOVED = 'removed';

    public function getLabel(): string
    {
        return match ($this) {
            self::OPENED => 'Otevřený',
            self::CLOSED => 'Uzavřený',
            self::REMOVED => 'Smazaný',
        };
    }
}
