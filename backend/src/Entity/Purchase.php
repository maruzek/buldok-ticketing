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
    private ?Entrance $entrance = null;

    #[ORM\ManyToOne(inversedBy: 'purchases')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Game $match = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $purchased_at = null;

    /**
     * @var Collection<int, PurchaseItem>
     */
    #[ORM\OneToMany(targetEntity: PurchaseItem::class, mappedBy: 'purchase', orphanRemoval: true)]
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
