<?php

namespace App\Controller\auth;

use App\Controller\ApiController;
use App\Service\auth\AuthService;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/auth')]
class AuthController extends ApiController
{
    public function __construct(
        private readonly AuthService $authService,
    ) {
        parent::__construct();
    }

    /**
     * POST /api/auth/login
     *
     * Body JSON: { "email": "...", "password": "..." }
     *
     * Respuesta correcta:
     * {
     *   "success": true,
     *   "data": {
     *     "token": "<JWT>",
     *     "admin": { "id": 1, "name": "...", "email": "...", "active": true }
     *   }
     * }
     */
    #[Route('/v1/login', name: 'auth_login', methods: ['POST'])]
    public function login(Request $request): JsonResponse
    {
        try {
            $body     = json_decode($request->getContent(), true) ?? [];
            $email    = trim($body['email'] ?? '');
            $password = $body['password'] ?? '';

            $dto = $this->authService->login($email, $password);

            return new JsonResponse($dto->jsonSerialize(), 200);
        } catch (\Exception $e) {
            return $this->buildErrorResponse($e);
        }
    }

    /**
     * POST /api/auth/logout
     *
     * Requiere Authorization: Bearer <JWT>
     * Devuelve confirmación; el cliente es responsable de descartar el token.
     *
     * Respuesta:
     * {
     *   "success": true,
     *   "data": { "message": "Sesión cerrada correctamente" }
     * }
     */
    #[Route('/v1/logout', name: 'auth_logout', methods: ['POST'])]
    public function logout(): JsonResponse
    {
        try {
            $dto = $this->authService->logout();

            return new JsonResponse($dto->jsonSerialize(), 200);
        } catch (\Exception $e) {
            return $this->buildErrorResponse($e);
        }
    }
}