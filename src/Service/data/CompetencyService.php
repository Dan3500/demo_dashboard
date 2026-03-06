<?php

namespace App\Service\data;

use App\Entity\data\Competency;
use App\Repository\data\CompetencyRepository;
use App\Repository\data\LevelRepository;
use App\Repository\data\TypeRepository;
use App\Service\CrudServiceInterface;

class CompetencyService implements CrudServiceInterface
{
    public function __construct(
        private readonly CompetencyRepository $repository,
        private readonly LevelRepository $levelRepository,
        private readonly TypeRepository $typeRepository,
    ) {}

    public function findAll(): array
    {
        return array_map(fn(Competency $c) => $c->jsonSerialize(), $this->repository->findAll());
    }

    public function findById(int $id): array
    {
        $competency = $this->repository->find($id);

        if (!$competency) {
            throw new \Exception('Competencia no encontrada', 404);
        }

        return $competency->jsonSerialize();
    }

    public function create(array $data): array
    {
        if (empty($data['name']))      { throw new \Exception('El campo "name" es obligatorio', 400); }
        if (empty($data['attribute'])) { throw new \Exception('El campo "attribute" es obligatorio', 400); }
        if (!isset($data['weight']))   { throw new \Exception('El campo "weight" es obligatorio', 400); }
        if (!isset($data['active']))   { throw new \Exception('El campo "active" es obligatorio', 400); }

        $competency = new Competency();
        $competency->setName($data['name']);
        $competency->setAttribute($data['attribute']);
        $competency->setWeight((int) $data['weight']);
        $competency->setActive((bool) $data['active']);

        if (!empty($data['level_id'])) {
            $level = $this->levelRepository->find((int) $data['level_id']);
            if (!$level) {
                throw new \Exception('Nivel no encontrado', 404);
            }
            $competency->setLevel($level);
        }

        if (!empty($data['type_id'])) {
            $type = $this->typeRepository->find((int) $data['type_id']);
            if (!$type) {
                throw new \Exception('Tipo no encontrado', 404);
            }
            $competency->setType($type);
        }

        $this->repository->save($competency, true);

        return $competency->jsonSerialize();
    }

    public function update(int $id, array $data): array
    {
        $competency = $this->repository->find($id);

        if (!$competency) {
            throw new \Exception('Competencia no encontrada', 404);
        }

        if (isset($data['name']))      { $competency->setName($data['name']); }
        if (isset($data['attribute'])) { $competency->setAttribute($data['attribute']); }
        if (isset($data['weight']))    { $competency->setWeight((int) $data['weight']); }
        if (isset($data['active']))    { $competency->setActive((bool) $data['active']); }

        if (array_key_exists('level_id', $data)) {
            if ($data['level_id'] === null) {
                $competency->setLevel(null);
            } else {
                $level = $this->levelRepository->find((int) $data['level_id']);
                if (!$level) {
                    throw new \Exception('Nivel no encontrado', 404);
                }
                $competency->setLevel($level);
            }
        }

        if (array_key_exists('type_id', $data)) {
            if ($data['type_id'] === null) {
                $competency->setType(null);
            } else {
                $type = $this->typeRepository->find((int) $data['type_id']);
                if (!$type) {
                    throw new \Exception('Tipo no encontrado', 404);
                }
                $competency->setType($type);
            }
        }

        $this->repository->save($competency, true);

        return $competency->jsonSerialize();
    }

    public function delete(int $id): void
    {
        $competency = $this->repository->find($id);

        if (!$competency) {
            throw new \Exception('Competencia no encontrada', 404);
        }

        $this->repository->remove($competency, true);
    }
}
