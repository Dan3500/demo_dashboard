<?php

namespace App\Service\data;

use App\Entity\data\Speciality;
use App\Repository\data\SpecialityRepository;
use App\Service\CrudServiceInterface;

class SpecialityService implements CrudServiceInterface
{
    public function __construct(
        private readonly SpecialityRepository $repository,
    ) {}

    public function findAll(): array
    {
        return array_map(fn(Speciality $s) => $s->jsonSerialize(), $this->repository->findAll());
    }

    public function findById(int $id): array
    {
        $speciality = $this->repository->find($id);

        if (!$speciality) {
            throw new \Exception('Especialidad no encontrada', 404);
        }

        return $speciality->jsonSerialize();
    }

    public function create(array $data): array
    {
        if (empty($data['name'])) {
            throw new \Exception('El campo "name" es obligatorio', 400);
        }

        $speciality = new Speciality();
        $speciality->setName($data['name']);
        $speciality->setDescription($data['description'] ?? '');
        $speciality->setActive($data['active'] ?? true);

        $this->repository->save($speciality, true);

        return $speciality->jsonSerialize();
    }

    public function update(int $id, array $data): array
    {
        $speciality = $this->repository->find($id);

        if (!$speciality) {
            throw new \Exception('Especialidad no encontrada', 404);
        }

        if (isset($data['name']))        { $speciality->setName($data['name']); }
        if (isset($data['description'])) { $speciality->setDescription($data['description']); }
        if (isset($data['active']))      { $speciality->setActive((bool) $data['active']); }

        $this->repository->save($speciality, true);

        return $speciality->jsonSerialize();
    }

    public function delete(int $id): void
    {
        $speciality = $this->repository->find($id);

        if (!$speciality) {
            throw new \Exception('Especialidad no encontrada', 404);
        }

        $this->repository->remove($speciality, true);
    }
}
