<?php

namespace App\Controller;


use App\Entity\DTO\ResponseDTO;
use App\Service\CrudServiceInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

abstract class AbstractCrudController extends ApiController
{
    abstract protected function getService(): CrudServiceInterface;

    // -------------------------------------------------------------------------
    // Helper central: encapsula validateSession + try/catch + buildSuccessResponse
    // -------------------------------------------------------------------------
    protected function handleAction(Request $request, callable $callback, int $status = 200): JsonResponse
    {
        $valid = [];
        try {
            $valid = $this->validateSession($request);
            $dto   = $callback();

            if ($status === 204) {
                return $this->addRenewedTokenHeader(new JsonResponse(null, 204), $valid);
            }

            return $this->buildSuccessResponse($dto, $valid, $status);
        } catch (\Exception $e) {
            return $this->buildErrorResponse($e, $valid);
        }
    }

    // --- CRUD genérico -------------------------------------------------------

    protected function index(Request $request): JsonResponse
    {
        return $this->handleAction($request, fn() => new ResponseDTO(
            success: true,
            data: $this->getService()->findAll(),
        ));
    }

    protected function read(int $id, Request $request): JsonResponse
    {
        return $this->handleAction($request, fn() => new ResponseDTO(
            success: true,
            data: $this->getService()->findById($id),
        ));
    }

    protected function create(Request $request): JsonResponse
    {
        return $this->handleAction($request, fn() => new ResponseDTO(
            success: true,
            data: $this->getService()->create(json_decode($request->getContent(), true) ?? []),
        ), 201);
    }

    protected function update(int $id, Request $request): JsonResponse
    {
        return $this->handleAction($request, fn() => new ResponseDTO(
            success: true,
            data: $this->getService()->update($id, json_decode($request->getContent(), true) ?? []),
        ));
    }

    protected function delete(int $id, Request $request): JsonResponse
    {
        return $this->handleAction($request, function() use ($id) {
            $this->getService()->delete($id);
            return null;
        }, 204);
    }
}
