<?php

namespace App\Service;

/// Interfaz genérica para servicios CRUD. Cada entidad tendrá su propia implementación.
interface CrudServiceInterface
{
    /** @return array[]  Lista de entidades ya serializadas */
    public function findAll(): array;

    /** @throws \Exception 404 si no existe */
    public function findById(int $id): array;

    /** @throws \Exception 400 si faltan campos */
    public function create(array $data): array;

    /** @throws \Exception 404 si no existe | 400 si faltan campos */
    public function update(int $id, array $data): array;

    /** @throws \Exception 404 si no existe */
    public function delete(int $id): void;
}
