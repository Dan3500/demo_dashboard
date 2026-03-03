<?php

namespace App\Service\auth;

use App\Entity\auth\Admin;
use App\Entity\DTO\ErrorDTO;
use App\Entity\DTO\ResponseDTO;
use App\Repository\auth\AdminRepository;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class AuthService
{
    public function __construct(
        private readonly AdminRepository $adminRepository,
        private readonly JWTTokenManagerInterface $jwtManager,
        private readonly UserPasswordHasherInterface $passwordHasher,
    ) {}

    /**
     * Autentica un administrador y devuelve un JWT.
     *
     * @throws \Exception 401 si las credenciales son inválidas
     * @throws \Exception 403 si la cuenta está inactiva
     */
    public function login(string $email, string $password): ResponseDTO
    {
        if (empty($email) || empty($password)) {
            throw new \Exception('Email y contraseña son obligatorios', 400);
        }

        /** @var Admin|null $admin */
        $admin = $this->adminRepository->findOneBy(['email' => $email]);

        if (!$admin) {
            throw new \Exception('Credenciales inválidas', 401);
        }

        if (!$admin->isActive()) {
            throw new \Exception('La cuenta está inactiva', 403);
        }

        if (!$this->passwordHasher->isPasswordValid($admin, $password)) {
            throw new \Exception('Credenciales inválidas', 401);
        }

        $token = $this->jwtManager->create($admin);

        return new ResponseDTO(
            success: true,
            data: [
                'token' => $token,
                'admin' => $admin->jsonSerialize(),
            ],
        );
    }

    /**
     * Logout simbólico: JWT es stateless, el cliente debe descartar el token.
     */
    public function logout(): ResponseDTO
    {
        return new ResponseDTO(
            success: true,
            data: ['message' => 'Sesión cerrada correctamente'],
        );
    }
}
