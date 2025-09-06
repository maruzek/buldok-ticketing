<?php

namespace App\Enum;

enum MatchStatus: string
{
    case ACTIVE = 'active';
    case FINISHED = 'finished';

    public function getLabel(): string
    {
        return match ($this) {
            self::ACTIVE => 'Otevřený',
            self::FINISHED => 'Ukončený',
        };
    }
}
