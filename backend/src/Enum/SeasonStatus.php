<?php

namespace App\Enum;

enum SeasonStatus: string
{
    case ACTIVE = 'active';
    case INACTIVE = 'inactive';
    case REMOVED = 'removed';

    public function getLabel(): string
    {
        return match ($this) {
            self::ACTIVE => 'Aktivní',
            self::INACTIVE => 'Neaktivní',
            self::REMOVED => 'Odstraněná',
        };
    }
}
