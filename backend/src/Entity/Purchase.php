<?php

namespace App\Entity;

use App\Repository\PurchaseRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: PurchaseRepository::class)]
class Purchase
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'purchases')]
    private ?User $sold_by = null;

    #[ORM\ManyToOne(inversedBy: 'purchases')]
    private ?Entrance $entrance_id = null;

    #[ORM\ManyToOne(inversedBy: 'purchases')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Matches $match_id = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $purchased_at = null;

    /**
     * @var Collection<int, PurchaseItem>
     */
    #[ORM\OneToMany(targetEntity: PurchaseItem::class, mappedBy: 'purchase_id', orphanRemoval: true)]
    private Collection $purchaseItems;

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
        return $this->sold_by;
    }

    public function setSoldBy(?User $sold_by): static
    {
        $this->sold_by = $sold_by;

        return $this;
    }

    public function getEntranceId(): ?Entrance
    {
        return $this->entrance_id;
    }

    public function setEntranceId(?Entrance $entrance_id): static
    {
        $this->entrance_id = $entrance_id;

        return $this;
    }

    public function getMatchId(): ?Matches
    {
        return $this->match_id;
    }

    public function setMatchId(?Matches $match_id): static
    {
        $this->match_id = $match_id;

        return $this;
    }

    public function getPurchasedAt(): ?\DateTimeImmutable
    {
        return $this->purchased_at;
    }

    public function setPurchasedAt(\DateTimeImmutable $purchased_at): static
    {
        $this->purchased_at = $purchased_at;

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
}
