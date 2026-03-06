<?php

namespace App\Controller\data;

use App\Controller\AbstractCrudController;
use App\Service\CrudServiceInterface;
use App\Service\data\TypeService;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/data')]
class TypeController extends AbstractCrudController
{
    public function __construct(
        private readonly TypeService $typeService,
    ) {
        parent::__construct();
    }

    protected function getService(): CrudServiceInterface
    {
        return $this->typeService;
    }

    #[Route('/v1/type', name: 'type_index', methods: ['GET'])]
    public function index(Request $request): JsonResponse
    {
        return parent::index($request);
    }

    #[Route('/v1/type/{id}', name: 'type_read', methods: ['GET'])]
    public function read(int $id, Request $request): JsonResponse
    {
        return parent::read($id, $request);
    }

    #[Route('/v1/type', name: 'type_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        return parent::create($request);
    }

    #[Route('/v1/type/{id}', name: 'type_update', methods: ['PUT'])]
    public function update(int $id, Request $request): JsonResponse
    {
        return parent::update($id, $request);
    }

    #[Route('/v1/type/{id}', name: 'type_delete', methods: ['DELETE'])]
    public function delete(int $id, Request $request): JsonResponse
    {
        return parent::delete($id, $request);
    }
}
