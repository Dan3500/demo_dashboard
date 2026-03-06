<?php

namespace App\Entity\data;

use App\Repository\data\SpecialityRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: SpecialityRepository::class)]
class Speciality implements \JsonSerializable
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $name = null;

    #[ORM\Column(length: 255)]
    private ?string $description = null;

    #[ORM\Column]
    private ?bool $active = null;

    /**
     * @var Collection<int, Level>
     */
    #[ORM\OneToMany(targetEntity: Level::class, mappedBy: 'speciality')]
    private Collection $levels;

    public function __construct()
    {
        $this->levels = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(string $description): static
    {
        $this->description = $description;

        return $this;
    }

    public function isActive(): ?bool
    {
        return $this->active;
    }

    public function setActive(bool $active): static
    {
        $this->active = $active;

        return $this;
    }

    /**
     * @return Collection<int, Level>
     */
    public function getLevels(): Collection
    {
        return $this->levels;
    }

    public function addLevel(Level $level): static
    {
        if (!$this->levels->contains($level)) {
            $this->levels->add($level);
            $level->setSpeciality($this);
        }

        return $this;
    }

    public function removeLevel(Level $level): static
    {
        if ($this->levels->removeElement($level)) {
            // anulamos la relación en el lado propietario (salvo que ya haya cambiado)
            if ($level->getSpeciality() === $this) {
                $level->setSpeciality(null);
            }
        }

        return $this;
    }

    public function jsonSerialize(): array
    {
        $personCount = 0;
        $competencyCount = 0;
        foreach ($this->levels as $level) {
            $personCount += $level->getPeople()->count();
            $competencyCount += $level->getCompetencies()->count();
        }

        return [
            'id'               => $this->id,
            'name'             => $this->name,
            'description'      => $this->description,
            'active'           => $this->active,
            'level_count'      => $this->levels->count(),
            'person_count'     => $personCount,
            'competency_count' => $competencyCount,
        ];
    }
}
