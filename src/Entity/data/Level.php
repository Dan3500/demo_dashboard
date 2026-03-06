<?php

namespace App\Entity\data;

use App\Repository\data\LevelRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: LevelRepository::class)]
class Level implements \JsonSerializable
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
    private ?int $percentage = null;

    #[ORM\ManyToOne(inversedBy: 'levels')]
    private ?Speciality $speciality = null;

    /**
     * @var Collection<int, Person>
     */
    #[ORM\OneToMany(targetEntity: Person::class, mappedBy: 'level')]
    private Collection $people;

    /**
     * @var Collection<int, Competency>
     */
    #[ORM\OneToMany(targetEntity: Competency::class, mappedBy: 'level')]
    private Collection $competencies;

    public function __construct()
    {
        $this->people       = new ArrayCollection();
        $this->competencies = new ArrayCollection();
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

    public function getPercentage(): ?int
    {
        return $this->percentage;
    }

    public function setPercentage(int $percentage): static
    {
        $this->percentage = $percentage;

        return $this;
    }

    public function getSpeciality(): ?Speciality
    {
        return $this->speciality;
    }

    public function setSpeciality(?Speciality $speciality): static
    {
        $this->speciality = $speciality;

        return $this;
    }

    /**
     * @return Collection<int, Person>
     */
    public function getPeople(): Collection
    {
        return $this->people;
    }

    public function addPerson(Person $person): static
    {
        if (!$this->people->contains($person)) {
            $this->people->add($person);
            $person->setLevel($this);
        }

        return $this;
    }

    public function removePerson(Person $person): static
    {
        if ($this->people->removeElement($person)) {
            // anulamos la relación en el lado propietario (salvo que ya haya cambiado)
            if ($person->getLevel() === $this) {
                $person->setLevel(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Competency>
     */
    public function getCompetencies(): Collection
    {
        return $this->competencies;
    }

    public function jsonSerialize(): array
    {
        return [
            'id'               => $this->id,
            'name'             => $this->name,
            'description'      => $this->description,
            'percentage'       => $this->percentage,
            'speciality_id'    => $this->speciality?->getId(),
            'competency_count' => $this->competencies->count(),
        ];
    }
}
