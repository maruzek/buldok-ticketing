<?php

namespace App\Enum;

enum MatchStatus: string
{
    case ACTIVE = 'Otevřený';
    case FINISHED  = 'Ukončený';
}
