<?php

namespace App\Enum;

enum SeasonStatus: string
{
    case ACTIVE = 'active';
    case INACTIVE = 'inactive';

    public function getLabel(): string
    {
        return match ($this) {
            self::ACTIVE => 'Aktivní',
            self::INACTIVE => 'Neaktivní',
        };
    }
}
