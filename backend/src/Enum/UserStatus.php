<?php

namespace App\Enum;

enum UserStatus: string
{
    case PENDING = 'pending';
    case ACTIVE = 'active';
    case SUSPENDED = 'suspended';
    case REMOVED = 'removed';

    public function getLabel(): string
    {
        return match ($this) {
            self::PENDING => 'Čekající na ověření',
            self::ACTIVE => 'Aktivní',
            self::SUSPENDED => 'Pozastavený',
            self::REMOVED => 'Smazaný',
        };
    }
}
