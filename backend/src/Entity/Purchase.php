<?php

namespace App\Entity;

use App\Repository\PurchaseRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: PurchaseRepository::class)]
class Purchase
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['purchase:read', 'purchase:admin_game_summary'])]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'purchases')]
    private ?User $soldBy = null;

    #[ORM\ManyToOne(inversedBy: 'purchases')]
    #[Groups(['purchase:admin_game_summary'])]
    private ?Entrance $entrance = null;

    #[ORM\ManyToOne(inversedBy: 'purchases')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Game $match = null;

    #[ORM\Column]
    #[Groups(['purchase:read', 'purchase:admin_game_summary'])]
    private ?\DateTimeImmutable $purchasedAt = null;

    /**
     * @var Collection<int, PurchaseItem>
     */
    #[ORM\OneToMany(targetEntity: PurchaseItem::class, mappedBy: 'purchase', orphanRemoval: true, cascade: ['remove'])]
    #[Groups(['purchase:read', 'purchase:admin_game_summary'])]
    private Collection $purchaseItems;

    #[ORM\OneToOne(mappedBy: 'Purchase', cascade: ['persist', 'remove'])]
    #[Groups(['purchase:read', 'purchase:admin_game_summary'])]
    private ?Payment $payment = null;

    #[ORM\Column(length: 20, nullable: true)]
    #[Groups(['purchase:read', 'purchase:admin_game_summary'])]
    private ?string $paymentType = null;

    public function __construct()
    {
        $this->purchaseItems = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getSoldBy(): ?User
    {
        return $this->soldBy;
    }

    public function setSoldBy(?User $soldBy): static
    {
        $this->soldBy = $soldBy;

        return $this;
    }

    public function getEntrance(): ?Entrance
    {
        return $this->entrance;
    }

    public function setEntrance(?Entrance $entrance): static
    {
        $this->entrance = $entrance;

        return $this;
    }

    public function getMatch(): ?Game
    {
        return $this->match;
    }

    public function setMatch(?Game $match): static
    {
        $this->match = $match;

        return $this;
    }

    public function getPurchasedAt(): ?\DateTimeImmutable
    {
        return $this->purchasedAt;
    }

    public function setPurchasedAt(\DateTimeImmutable $purchasedAt): static
    {
        $this->purchasedAt = $purchasedAt;

        return $this;
    }

    /**
     * @return Collection<int, PurchaseItem>
     */
    public function getPurchaseItems(): Collection
    {
        return $this->purchaseItems;
    }

    public function addPurchaseItem(PurchaseItem $purchaseItem): static
    {
        if (!$this->purchaseItems->contains($purchaseItem)) {
            $this->purchaseItems->add($purchaseItem);
            $purchaseItem->setPurchaseId($this);
        }

        return $this;
    }

    public function removePurchaseItem(PurchaseItem $purchaseItem): static
    {
        if ($this->purchaseItems->removeElement($purchaseItem)) {
            // set the owning side to null (unless already changed)
            if ($purchaseItem->getPurchaseId() === $this) {
                $purchaseItem->setPurchaseId(null);
            }
        }

        return $this;
    }

    public function getPayment(): ?Payment
    {
        return $this->payment;
    }

    public function setPayment(Payment $payment): static
    {
        // set the owning side of the relation if necessary
        if ($payment->getPurchase() !== $this) {
            $payment->setPurchase($this);
        }

        $this->payment = $payment;

        return $this;
    }

    public function getPaymentType(): ?string
    {
        return $this->paymentType;
    }

    public function setPaymentType(?string $paymentType): static
    {
        $this->paymentType = $paymentType;

        return $this;
    }
}
