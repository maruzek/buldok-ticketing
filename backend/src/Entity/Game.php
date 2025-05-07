<?php

namespace App\Entity;

use App\Enum\MatchStatus;
use App\Repository\GameRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: GameRepository::class)]
class Game
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $rival = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $description = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $played_at = null;

    #[ORM\Column(length: 15)]
    private ?MatchStatus $status = null;

    // /**
    //  * @var Collection<int, Purchase>
    //  */
    // #[ORM\OneToMany(targetEntity: Purchase::class, mappedBy: 'match', cascade: ['persist', 'remove'])]
    // private Collection $purchases;

    // public function __construct()
    // {
    //     $this->purchases = new ArrayCollection();
    // }


    public function getId(): ?int
    {
        return $this->id;
    }

    public function getRival(): ?string
    {
        return $this->rival;
    }

    public function setRival(string $rival): static
    {
        $this->rival = $rival;

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $this->description = $description;

        return $this;
    }

    public function getPlayedAt(): ?\DateTimeInterface
    {
        return $this->played_at;
    }

    public function setPlayedAt(\DateTimeInterface $played_at): static
    {
        $this->played_at = $played_at;

        return $this;
    }

    public function getStatus(): ?MatchStatus
    {
        return $this->status;
    }

    public function setStatus(MatchStatus $status): static
    {
        $this->status = $status;

        return $this;
    }

    // /**
    //  * @return Collection<int, Purchase>
    //  */
    // public function getPurchases(): Collection
    // {
    //     return $this->purchases;
    // }

    // public function addPurchase(Purchase $purchase): static
    // {
    //     if (!$this->purchases->contains($purchase)) {
    //         $this->purchases->add($purchase);
    //         $purchase->setMatch($this); // Ensure the owning side is set
    //     }

    //     return $this;
    // }

    // public function removePurchase(Purchase $purchase): static
    // {
    //     if ($this->purchases->removeElement($purchase)) {
    //         // Set the owning side to null (unless already changed)
    //         if ($purchase->getMatch() === $this) {
    //             $purchase->setMatch(null);
    //         }
    //     }

    //     return $this;
    // }
}
