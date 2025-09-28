<?php

namespace App\Entity;

use App\Repository\PaymentRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: PaymentRepository::class)]
class Payment
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    #[Groups(['purchase:table'])]
    private ?\DateTimeInterface $paid_at = null;

    #[ORM\Column]
    #[Groups(['purchase:table'])]
    private ?float $amount = null;

    #[ORM\Column(length: 20)]
    #[Groups(['purchase:read', 'purchase:admin_game_summary', 'purchase:table'])]
    private ?string $status = null;

    #[ORM\Column(length: 255)]
    #[Groups(['purchase:read', 'purchase:admin_game_summary', 'purchase:table'])]
    private ?string $variableSymbol = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $generatedAt = null;

    #[ORM\OneToOne(inversedBy: 'payment', cascade: ['persist', 'remove'])]
    #[ORM\JoinColumn(nullable: false)]
    private ?Purchase $Purchase = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['purchase:table'])]
    private ?int $bankAccountNumber = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['purchase:table'])]
    private ?int $bankCode = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['purchase:table'])]
    private ?string $paymentMessage = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['purchase:table'])]
    private ?string $bankUserIdentification = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['purchase:table'])]
    private ?string $bankPaymentType = null;

    #[ORM\Column(length: 3, nullable: true)]
    #[Groups(['purchase:table'])]
    private ?string $bankPaymentCurrancy = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['purchase:table'])]
    private ?string $bankMovementId = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['purchase:table'])]
    private ?string $bankAccountName = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['purchase:table'])]
    private ?string $bankName = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['purchase:table'])]
    private ?string $bankInstructionId = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getPaidAt(): ?\DateTimeInterface
    {
        return $this->paid_at;
    }

    public function setPaidAt(?\DateTimeInterface $paid_at): static
    {
        $this->paid_at = $paid_at;

        return $this;
    }

    public function getAmount(): ?float
    {
        return $this->amount;
    }

    public function setAmount(float $amount): static
    {
        $this->amount = $amount;

        return $this;
    }

    public function getStatus(): ?string
    {
        return $this->status;
    }

    public function setStatus(string $status): static
    {
        $this->status = $status;

        return $this;
    }

    public function getVariableSymbol(): ?string
    {
        return $this->variableSymbol;
    }

    public function setVariableSymbol(string $variableSymbol): static
    {
        $this->variableSymbol = $variableSymbol;

        return $this;
    }

    public function getGeneratedAt(): ?\DateTimeImmutable
    {
        return $this->generatedAt;
    }

    public function setGeneratedAt(\DateTimeImmutable $generatedAt): static
    {
        $this->generatedAt = $generatedAt;

        return $this;
    }

    public function getPurchase(): ?Purchase
    {
        return $this->Purchase;
    }

    public function setPurchase(Purchase $Purchase): static
    {
        $this->Purchase = $Purchase;

        return $this;
    }

    public function getBankAccountNumber(): ?int
    {
        return $this->bankAccountNumber;
    }

    public function setBankAccountNumber(?int $bankAccountNumber): static
    {
        $this->bankAccountNumber = $bankAccountNumber;

        return $this;
    }

    public function getBankCode(): ?int
    {
        return $this->bankCode;
    }

    public function setBankCode(?int $bankCode): static
    {
        $this->bankCode = $bankCode;

        return $this;
    }

    public function getPaymentMessage(): ?string
    {
        return $this->paymentMessage;
    }

    public function setPaymentMessage(?string $paymentMessage): static
    {
        $this->paymentMessage = $paymentMessage;

        return $this;
    }

    public function getBankUserIdentification(): ?string
    {
        return $this->bankUserIdentification;
    }

    public function setBankUserIdentification(?string $bankUserIdentification): static
    {
        $this->bankUserIdentification = $bankUserIdentification;

        return $this;
    }

    public function getBankPaymentType(): ?string
    {
        return $this->bankPaymentType;
    }

    public function setBankPaymentType(?string $bankPaymentType): static
    {
        $this->bankPaymentType = $bankPaymentType;

        return $this;
    }

    public function getBankPaymentCurrancy(): ?string
    {
        return $this->bankPaymentCurrancy;
    }

    public function setBankPaymentCurrancy(?string $bankPaymentCurrancy): static
    {
        $this->bankPaymentCurrancy = $bankPaymentCurrancy;

        return $this;
    }

    public function getBankMovementId(): ?int
    {
        return $this->bankMovementId;
    }

    public function setBankMovementId(?int $bankMovementId): static
    {
        $this->bankMovementId = $bankMovementId;

        return $this;
    }

    public function getBankAccountName(): ?string
    {
        return $this->bankAccountName;
    }

    public function setBankAccountName(?string $bankAccountName): static
    {
        $this->bankAccountName = $bankAccountName;

        return $this;
    }

    public function getBankName(): ?string
    {
        return $this->bankName;
    }

    public function setBankName(?string $bankName): static
    {
        $this->bankName = $bankName;

        return $this;
    }

    public function getBankInstructionId(): ?string
    {
        return $this->bankInstructionId;
    }

    public function setBankInstructionId(?string $bankInstructionId): static
    {
        $this->bankInstructionId = $bankInstructionId;

        return $this;
    }
}
