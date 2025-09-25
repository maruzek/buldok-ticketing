<?php

namespace App\DTO;

use App\Entity\Game;
use Symfony\Component\Serializer\Annotation\Groups;

final class MatchStatisticsDto
{
    public function __construct(
        #[Groups(['match:stats'])]
        public readonly Game $match,

        #[Groups(['match:stats'])]
        public readonly string $totalEarnings,

        #[Groups(['match:stats'])]
        public readonly int $totalTickets,

        #[Groups(['match:stats'])]
        public readonly int $fullTicketsCount,

        #[Groups(['match:stats'])]
        public readonly string $fullTicketsEarnings,

        #[Groups(['match:stats'])]
        public readonly int $halfTicketsCount,

        #[Groups(['match:stats'])]
        public readonly string $halfTicketsEarnings,

        #[Groups(['match:stats'])]
        public readonly array $salesOverTime,

        #[Groups(['match:stats'])]
        public readonly array $entrancesStats
    ) {}
}
