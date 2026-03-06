<?php

namespace App\Controller\data;

use App\Controller\AbstractCrudController;
use App\Service\CrudServiceInterface;
use App\Service\data\LevelService;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/data')]
class LevelController extends AbstractCrudController
{
    public function __construct(
        private readonly LevelService $levelService,
    ) {
        parent::__construct();
    }

    protected function getService(): CrudServiceInterface
    {
        return $this->levelService;
    }

    #[Route('/v1/level', name: 'level_index', methods: ['GET'])]
    public function index(Request $request): JsonResponse
    {
        return parent::index($request);
    }

    #[Route('/v1/level/{id}', name: 'level_read', methods: ['GET'])]
    public function read(int $id, Request $request): JsonResponse
    {
        return parent::read($id, $request);
    }

    #[Route('/v1/level', name: 'level_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        return parent::create($request);
    }

    #[Route('/v1/level/{id}', name: 'level_update', methods: ['PUT'])]
    public function update(int $id, Request $request): JsonResponse
    {
        return parent::update($id, $request);
    }

    #[Route('/v1/level/{id}', name: 'level_delete', methods: ['DELETE'])]
    public function delete(int $id, Request $request): JsonResponse
    {
        return parent::delete($id, $request);
    }
}
