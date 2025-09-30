<?php

namespace App\Enum;

enum MatchStatus: string
{
    case ACTIVE = 'active';
    case FINISHED = 'finished';
    case REMOVED = 'removed';

    public function getLabel(): string
    {
        return match ($this) {
            self::ACTIVE => 'Otevřený',
            self::FINISHED => 'Ukončený',
            self::REMOVED => 'Smazaný',
        };
    }
}
