<?php

namespace App\DTO;

use Symfony\Component\Validator\Constraints as Assert;

final class CreateMatchDto
{
    #[Assert\NotBlank(message: 'Soupeř je povinný')]
    #[Assert\Length(min: 2, max: 255, minMessage: 'Název soupeře musí mít alespoň 2 znaky')]
    public string $rival;

    #[Assert\NotBlank(message: 'Datum zápasu je povinný')]
    #[Assert\DateTime(format: 'Y-m-d\TH:i:s.v\Z', message: 'Neplatný formát data (očekáván YYYY-MM-DD HH:MM:SS)')]
    public string $playedAt;

    #[Assert\Type('string')]
    public ?string $description = null;
}
