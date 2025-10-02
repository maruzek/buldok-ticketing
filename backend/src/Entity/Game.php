<?php

namespace App\Entity;

use App\Enum\MatchStatus;
use App\Repository\GameRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: GameRepository::class)]
class Game
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['game:admin_dashboard', "match:read", "match:stats", "match:admin_list"])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['game:admin_dashboard', "match:read", "match:stats", "match:admin_list"])]
    private ?string $rival = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(["match:read", "match:stats"])]
    private ?string $description = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(['game:admin_dashboard', "match:read", "match:stats", "match:admin_list"])]
    private ?\DateTimeInterface $playedAt = null;

    #[ORM\Column(length: 15, enumType: MatchStatus::class)]
    #[Groups(["match:read", "match:stats", "match:admin_list"])]
    private ?MatchStatus $status = null;

    /**
     * @var Collection<int, Purchase>
     */
    #[ORM\OneToMany(targetEntity: Purchase::class, mappedBy: 'match', cascade: ['persist', 'remove'])]
    #[Groups(['game:admin_dashboard', "match:read"])]
    private Collection $purchases;

    #[ORM\ManyToOne(inversedBy: 'games')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(["match:read", "match:stats", "match:admin_list"])]
    private ?Season $season = null;

    public function __construct()
    {
        $this->purchases = new ArrayCollection();
    }


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
        return $this->playedAt;
    }

    public function setPlayedAt(\DateTimeInterface $playedAt): static
    {
        $this->playedAt = $playedAt;

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

    /**
     * @return Collection<int, Purchase>
     */
    public function getPurchases(): Collection
    {
        return $this->purchases;
    }

    public function addPurchase(Purchase $purchase): static
    {
        if (!$this->purchases->contains($purchase)) {
            $this->purchases->add($purchase);
            $purchase->setMatch($this); // Ensure the owning side is set
        }

        return $this;
    }

    public function removePurchase(Purchase $purchase): static
    {
        if ($this->purchases->removeElement($purchase)) {
            // Set the owning side to null (unless already changed)
            if ($purchase->getMatch() === $this) {
                $purchase->setMatch(null);
            }
        }

        return $this;
    }

    public function getSeason(): ?Season
    {
        return $this->season;
    }

    public function setSeason(?Season $season): static
    {
        $this->season = $season;

        return $this;
    }
}
