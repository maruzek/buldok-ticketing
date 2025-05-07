<?php

namespace App\Entity;

use App\Repository\PurchaseItemRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: PurchaseItemRepository::class)]
class PurchaseItem
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'purchaseItems')]
    #[ORM\JoinColumn(name: 'purchase_id', nullable: false)]
    private ?Purchase $purchase = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?TicketType $ticket_type = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2)]
    private ?string $price_at_purchase = null;

    #[ORM\Column]
    private ?int $quantity = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getPurchaseId(): ?Purchase
    {
        return $this->purchase;
    }

    public function setPurchaseId(?Purchase $purchase): static
    {
        $this->purchase = $purchase;

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

    public function getPriceAtPurchase(): ?string
    {
        return $this->price_at_purchase;
    }

    public function setPriceAtPurchase(string $price_at_purchase): static
    {
        $this->price_at_purchase = $price_at_purchase;

        return $this;
    }

    public function getQuantity(): ?int
    {
        return $this->quantity;
    }

    public function setQuantity(int $quantity): static
    {
        $this->quantity = $quantity;

        return $this;
    }
}
