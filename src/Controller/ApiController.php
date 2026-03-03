<?php

namespace App\Controller;

use App\Entity\DTO\ResponseDTO;
use App\Entity\DTO\ErrorDTO;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api')]
class ApiController extends AbstractController
{
    public function __construct()
    {
    }

    /**
     * Mapa de códigos HTTP a títulos de error.
     * Sobreescribir en el controller hijo para añadir títulos específicos.
     */
    protected function getErrorTitles(): array
    {
        return [
            400 => 'BAD_REQUEST',
            401 => 'UNAUTHORIZED',
            403 => 'FORBIDDEN',
            404 => 'NOT_FOUND',
        ];
    }

    /**
     * Construye una JsonResponse de error a partir de una excepción.
     */
    protected function buildErrorResponse(\Exception $e, array $valid = []): JsonResponse
    {
        $title = $this->getErrorTitles()[$e->getCode()] ?? 'INTERNAL_SERVER_ERROR';

        $error = new ErrorDTO(
            title: $title,
            message: $e->getMessage(),
            code: $e->getCode()
        );

        $dto = new ResponseDTO(
            success: false,
            error: $error,
        );

        $jsonResponse = new JsonResponse($dto->jsonSerialize(), $e->getCode() ?: 500);
        return $this->addRenewedTokenHeader($jsonResponse, $valid);
    }

    /**
     * Método helper para añadir token renovado a la respuesta
     *
     * @param JsonResponse $response Respuesta JSON
     * @param array $validationResult Resultado de validateSession
     * @return JsonResponse Respuesta con header de renovación si aplica
     */
    protected function addRenewedTokenHeader(JsonResponse $response, array $validationResult): JsonResponse
    {
        if (isset($validationResult['renewed_token']) && $validationResult['renewed_token']) {
            $response->headers->set('X-Renewed-Token', $validationResult['renewed_token']);
        }

        return $response;
    }

}
