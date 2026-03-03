<?php

namespace App\Entity\data;

use App\Repository\data\EvaluationRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: EvaluationRepository::class)]
class Evaluation implements \JsonSerializable
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\OneToOne(cascade: ['persist', 'remove'])]
    private ?Person $person = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $created_at = null;

    #[ORM\Column]
    private ?int $progress = null;

    #[ORM\Column]
    private array $competencies = [];

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getPerson(): ?Person
    {
        return $this->person;
    }

    public function setPerson(?Person $person): static
    {
        $this->person = $person;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->created_at;
    }

    public function setCreatedAt(\DateTimeImmutable $created_at): static
    {
        $this->created_at = $created_at;

        return $this;
    }

    public function getProgress(): ?int
    {
        return $this->progress;
    }

    public function setProgress(int $progress): static
    {
        $this->progress = $progress;

        return $this;
    }

    public function getCompetencies(): array
    {
        return $this->competencies;
    }

    public function setCompetencies(array $competencies): static
    {
        $this->competencies = $competencies;

        return $this;
    }

    public function jsonSerialize(): array
    {
        return [
            'id'           => $this->id,
            'person_id'    => $this->person?->getId(),
            'created_at'   => $this->created_at?->format(\DateTimeInterface::ATOM),
            'progress'     => $this->progress,
            'competencies' => $this->competencies,
        ];
    }
}
