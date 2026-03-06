<?php

namespace App\Controller;

use App\Entity\DTO\ResponseDTO;
use App\Entity\DTO\ErrorDTO;
use App\Repository\auth\AdminRepository;
use Lexik\Bundle\JWTAuthenticationBundle\Encoder\JWTEncoderInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Contracts\Service\Attribute\Required;

#[Route('/api')]
class ApiController extends AbstractController
{
    private JWTEncoderInterface $jwtEncoder;
    private JWTTokenManagerInterface $jwtManager;
    private AdminRepository $adminRepository;

    public function __construct()
    {
    }

    #[Required]
    public function setJwtServices(
        JWTEncoderInterface $jwtEncoder,
        JWTTokenManagerInterface $jwtManager,
        AdminRepository $adminRepository,
    ): void {
        $this->jwtEncoder = $jwtEncoder;
        $this->jwtManager = $jwtManager;
        $this->adminRepository = $adminRepository;
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
     * Valida la sesión del usuario y renueva el token con TTL fresco.
     * Lanza una excepción con código 401 si el token no es válido o el usuario está inactivo.
     * Retorna: ['user' => $admin, 'renewed_token' => 'nuevo_jwt']
     */
    protected function validateSession(Request $request): array
    {
        $authHeader = $request->headers->get('Authorization');

        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            throw new \Exception('Token ausente o con formato inválido', 401);
        }

        $token = substr($authHeader, 7);

        try {
            $payload = $this->jwtEncoder->decode($token);
        } catch (\Exception) {
            throw new \Exception('Token inválido o expirado', 401);
        }

        $email = $payload['username'] ?? $payload['email'] ?? null;
        if (!$email) {
            throw new \Exception('Token inválido: falta el identificador de usuario', 401);
        }

        $admin = $this->adminRepository->findOneBy(['email' => $email]);
        if (!$admin || !$admin->isActive()) {
            throw new \Exception('Usuario no encontrado o inactivo', 401);
        }

        $renewedToken = $this->jwtManager->create($admin);

        return [
            'user'          => $admin,
            'renewed_token' => $renewedToken,
        ];
    }

    /**
     * Construye una JsonResponse de éxito e inyecta el token renovado si existe.
     */
    protected function buildSuccessResponse(ResponseDTO $dto, array $valid = [], int $status = 200): JsonResponse
    {
        $jsonResponse = new JsonResponse($dto->jsonSerialize(), $status);
        return $this->addRenewedTokenHeader($jsonResponse, $valid);
    }

    /**
     * Construye una JsonResponse de error a partir de una excepción.
     */
    protected function buildErrorResponse(\Exception $e, array $valid = []): JsonResponse
    {
        $code = $e->getCode();

        // Los códigos de excepción pueden ser códigos de error de BD (p. ej. 7 de PDO) u otros
        // valores no HTTP. Solo aceptamos códigos de estado HTTP válidos (400–599).
        $httpStatus = ($code >= 400 && $code <= 599) ? $code : 500;

        $title = $this->getErrorTitles()[$httpStatus] ?? 'INTERNAL_SERVER_ERROR';

        $error = new ErrorDTO(
            title: $title,
            message: $e->getMessage(),
            code: $httpStatus
        );

        $dto = new ResponseDTO(
            success: false,
            error: $error,
        );

        $jsonResponse = new JsonResponse($dto->jsonSerialize(), $httpStatus);
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
