<?php

namespace App\Entity;

use App\Repository\PurchaseItemRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: PurchaseItemRepository::class)]
class PurchaseItem
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'purchaseItems')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Purchase $purchase_id = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?TicketType $ticket_type = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getPurchaseId(): ?Purchase
    {
        return $this->purchase_id;
    }

    public function setPurchaseId(?Purchase $purchase_id): static
    {
        $this->purchase_id = $purchase_id;

        return $this;
    }

    public function getTicketType(): ?TicketType
    {
        return $this->ticket_type;
    }

    public function setTicketType(?TicketType $ticket_type): static
    {
        $this->ticket_type = $ticket_type;

        return $this;
    }
}
