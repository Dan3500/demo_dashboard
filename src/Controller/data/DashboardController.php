<?php

namespace App\Controller\data;

use App\Controller\ApiController;
use App\Entity\DTO\ResponseDTO;
use App\Service\data\DashboardService;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/data')]
class DashboardController extends ApiController
{
    public function __construct(
        private readonly DashboardService $dashboardService,
    ) {
        parent::__construct();
    }

    #[Route('/v1/dashboard', name: 'dashboard_stats', methods: ['GET'])]
    public function stats(Request $request): JsonResponse
    {
        $valid = [];
        try {
            $valid        = $this->validateSession($request);
            $specialityId = $request->query->get('speciality_id')
                ? (int) $request->query->get('speciality_id')
                : null;

            $data = $this->dashboardService->getStats($specialityId);

            $dto      = new ResponseDTO(success: true, data: $data);
            $response = new JsonResponse($dto->jsonSerialize(), 200);

            return $this->addRenewedTokenHeader($response, $valid);
        } catch (\Exception $e) {
            return $this->buildErrorResponse($e, $valid);
        }
    }
}
