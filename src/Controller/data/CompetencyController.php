<?php

namespace App\Controller\data;

use App\Controller\AbstractCrudController;
use App\Service\CrudServiceInterface;
use App\Service\data\CompetencyService;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/data')]
class CompetencyController extends AbstractCrudController
{
    public function __construct(
        private readonly CompetencyService $competencyService,
    ) {
        parent::__construct();
    }

    protected function getService(): CrudServiceInterface
    {
        return $this->competencyService;
    }

    #[Route('/v1/competency', name: 'competency_index', methods: ['GET'])]
    public function index(Request $request): JsonResponse
    {
        return parent::index($request);
    }

    #[Route('/v1/competency/{id}', name: 'competency_read', methods: ['GET'])]
    public function read(int $id, Request $request): JsonResponse
    {
        return parent::read($id, $request);
    }

    #[Route('/v1/competency', name: 'competency_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        return parent::create($request);
    }

    #[Route('/v1/competency/{id}', name: 'competency_update', methods: ['PUT'])]
    public function update(int $id, Request $request): JsonResponse
    {
        return parent::update($id, $request);
    }

    #[Route('/v1/competency/{id}', name: 'competency_delete', methods: ['DELETE'])]
    public function delete(int $id, Request $request): JsonResponse
    {
        return parent::delete($id, $request);
    }
}
