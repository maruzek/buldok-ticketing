<?php

namespace App\Entity;

use App\Enum\SeasonStatus;
use App\Repository\SeasonRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: SeasonRepository::class)]
class Season
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['season:read', "match:admin_list"])]
    private ?int $id = null;

    #[ORM\Column(length: 9, unique: true)]
    #[Assert\NotBlank]
    #[Assert\Regex(
        pattern: '/^\d{4}\/\d{4}$/',
        message: 'The years must be in the format YYYY/YYYY.'
    )]
    #[Groups(['season:read', "match:admin_list"])]
    private ?string $years = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    #[Groups(['season:read'])]
    private ?\DateTime $startAt = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    #[Groups(['season:read'])]
    private ?\DateTime $endAt = null;

    /**
     * @var Collection<int, Game>
     */
    #[ORM\OneToMany(targetEntity: Game::class, mappedBy: 'season')]
    private Collection $games;

    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(length: 255, enumType: SeasonStatus::class)]
    #[Groups(['season:read'])]
    private ?SeasonStatus $status = null;

    public function __construct()
    {
        $this->games = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getYears(): ?string
    {
        return $this->years;
    }

    public function setYears(string $years): static
    {
        $this->years = $years;

        return $this;
    }

    public function getStartAt(): ?\DateTime
    {
        return $this->startAt;
    }

    public function setStartAt(\DateTime $startAt): static
    {
        $this->startAt = $startAt;

        return $this;
    }

    public function getEndAt(): ?\DateTime
    {
        return $this->endAt;
    }

    public function setEndAt(\DateTime $endAt): static
    {
        $this->endAt = $endAt;

        return $this;
    }

    /**
     * @return Collection<int, Game>
     */
    public function getGames(): Collection
    {
        return $this->games;
    }

    public function addGame(Game $game): static
    {
        if (!$this->games->contains($game)) {
            $this->games->add($game);
            $game->setSeason($this);
        }

        return $this;
    }

    public function removeGame(Game $game): static
    {
        if ($this->games->removeElement($game)) {
            // set the owning side to null (unless already changed)
            if ($game->getSeason() === $this) {
                $game->setSeason(null);
            }
        }

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeImmutable $createdAt): static
    {
        $this->createdAt = $createdAt;

        return $this;
    }

    public function getStatus(): ?SeasonStatus
    {
        return $this->status;
    }

    public function setStatus(SeasonStatus $status): static
    {
        $this->status = $status;

        return $this;
    }
}
