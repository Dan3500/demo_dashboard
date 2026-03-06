<?php

namespace App\Service\data;

use App\Entity\data\Type;
use App\Repository\data\TypeRepository;
use App\Service\CrudServiceInterface;

class TypeService implements CrudServiceInterface
{
    public function __construct(
        private readonly TypeRepository $repository,
    ) {}

    public function findAll(): array
    {
        return array_map(fn(Type $t) => $t->jsonSerialize(), $this->repository->findAll());
    }

    public function findById(int $id): array
    {
        $type = $this->repository->find($id);

        if (!$type) {
            throw new \Exception('Tipo no encontrado', 404);
        }

        return $type->jsonSerialize();
    }

    public function create(array $data): array
    {
        if (empty($data['name'])) {
            throw new \Exception('El campo "name" es obligatorio', 400);
        }

        $type = new Type();
        $type->setName($data['name']);

        $this->repository->save($type, true);

        return $type->jsonSerialize();
    }

    public function update(int $id, array $data): array
    {
        $type = $this->repository->find($id);

        if (!$type) {
            throw new \Exception('Tipo no encontrado', 404);
        }

        if (isset($data['name'])) {
            $type->setName($data['name']);
        }

        $this->repository->save($type, true);

        return $type->jsonSerialize();
    }

    public function delete(int $id): void
    {
        $type = $this->repository->find($id);

        if (!$type) {
            throw new \Exception('Tipo no encontrado', 404);
        }

        $this->repository->remove($type, true);
    }
}
