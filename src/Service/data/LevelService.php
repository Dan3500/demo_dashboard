<?php

namespace App\Service\data;

use App\Entity\data\Level;
use App\Repository\data\LevelRepository;
use App\Repository\data\SpecialityRepository;
use App\Service\CrudServiceInterface;

class LevelService implements CrudServiceInterface
{
    public function __construct(
        private readonly LevelRepository $repository,
        private readonly SpecialityRepository $specialityRepository,
    ) {}

    public function findAll(): array
    {
        return array_map(fn(Level $l) => $l->jsonSerialize(), $this->repository->findAll());
    }

    public function findById(int $id): array
    {
        $level = $this->repository->find($id);

        if (!$level) {
            throw new \Exception('Nivel no encontrado', 404);
        }

        return $level->jsonSerialize();
    }

    public function create(array $data): array
    {
        if (empty($data['name'])) {
            throw new \Exception('El campo "name" es obligatorio', 400);
        }

        $level = new Level();
        $level->setName($data['name']);
        $level->setDescription($data['description'] ?? '');
        $level->setPercentage((int) ($data['percentage'] ?? 0));

        if (!empty($data['speciality_id'])) {
            $speciality = $this->specialityRepository->find((int) $data['speciality_id']);
            if (!$speciality) {
                throw new \Exception('Especialidad no encontrada', 404);
            }
            $level->setSpeciality($speciality);
        }

        $this->repository->save($level, true);

        return $level->jsonSerialize();
    }

    public function update(int $id, array $data): array
    {
        $level = $this->repository->find($id);

        if (!$level) {
            throw new \Exception('Nivel no encontrado', 404);
        }

        if (isset($data['name']))        { $level->setName($data['name']); }
        if (isset($data['description'])) { $level->setDescription($data['description']); }
        if (isset($data['percentage']))  { $level->setPercentage((int) $data['percentage']); }

        if (array_key_exists('speciality_id', $data)) {
            if ($data['speciality_id'] === null) {
                $level->setSpeciality(null);
            } else {
                $speciality = $this->specialityRepository->find((int) $data['speciality_id']);
                if (!$speciality) {
                    throw new \Exception('Especialidad no encontrada', 404);
                }
                $level->setSpeciality($speciality);
            }
        }

        $this->repository->save($level, true);

        return $level->jsonSerialize();
    }

    public function delete(int $id): void
    {
        $level = $this->repository->find($id);

        if (!$level) {
            throw new \Exception('Nivel no encontrado', 404);
        }

        $this->repository->remove($level, true);
    }
}
