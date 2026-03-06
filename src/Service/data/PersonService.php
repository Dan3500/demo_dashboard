<?php

namespace App\Service\data;

use App\Entity\data\Person;
use App\Repository\data\PersonRepository;
use App\Repository\data\LevelRepository;
use App\Service\CrudServiceInterface;

class PersonService implements CrudServiceInterface
{
    public function __construct(
        private readonly PersonRepository $repository,
        private readonly LevelRepository $levelRepository,
    ) {}

    public function findAll(): array
    {
        return array_map(fn(Person $p) => $p->jsonSerialize(), $this->repository->findAll());
    }

    public function findById(int $id): array
    {
        $person = $this->repository->find($id);

        if (!$person) {
            throw new \Exception('Persona no encontrada', 404);
        }

        return $person->jsonSerialize();
    }

    public function create(array $data): array
    {
        if (empty($data['name'])) {
            throw new \Exception('El campo "name" es obligatorio', 400);
        }
        if (!isset($data['evaluator'])) {
            throw new \Exception('El campo "evaluator" es obligatorio', 400);
        }
        if (!isset($data['active'])) {
            throw new \Exception('El campo "active" es obligatorio', 400);
        }

        $person = new Person();
        $person->setName($data['name']);
        $person->setEvaluator((int) $data['evaluator']);
        $person->setActive((bool) $data['active']);

        if (!empty($data['level_id'])) {
            $level = $this->levelRepository->find((int) $data['level_id']);
            if (!$level) {
                throw new \Exception('Nivel no encontrado', 404);
            }
            $person->setLevel($level);
        }

        $this->repository->save($person, true);

        return $person->jsonSerialize();
    }

    public function update(int $id, array $data): array
    {
        $person = $this->repository->find($id);

        if (!$person) {
            throw new \Exception('Persona no encontrada', 404);
        }

        if (isset($data['name']))      { $person->setName($data['name']); }
        if (isset($data['evaluator'])) { $person->setEvaluator((int) $data['evaluator']); }
        if (isset($data['active']))    { $person->setActive((bool) $data['active']); }

        if (array_key_exists('level_id', $data)) {
            if ($data['level_id'] === null) {
                $person->setLevel(null);
            } else {
                $level = $this->levelRepository->find((int) $data['level_id']);
                if (!$level) {
                    throw new \Exception('Nivel no encontrado', 404);
                }
                $person->setLevel($level);
            }
        }

        $this->repository->save($person, true);

        return $person->jsonSerialize();
    }

    public function delete(int $id): void
    {
        $person = $this->repository->find($id);

        if (!$person) {
            throw new \Exception('Persona no encontrada', 404);
        }

        $this->repository->remove($person, true);
    }
}
