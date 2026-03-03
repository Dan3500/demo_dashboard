<?php

namespace App\Entity\DTO;

use App\Entity\DTO\ErrorDTO;

/**
 * DTO genérico para respuestas API estándar
 * 
 * Estructura siempre consistente:
 * {
 *   "success": boolean,
 *   "data": mixed (opcional - cualquier estructura),
 *   "error": ErrorDTO (opcional - solo cuando success = false)
 * }
 */
class ResponseDTO implements \JsonSerializable
{
    public function __construct(
        private bool $success,
        private mixed $data = null,
        private ?ErrorDTO $error = null,
    ) {}

    public function jsonSerialize(): array
    {
        $response = [
            'success' => $this->success,
        ];

        if ($this->data !== null) {
            $response['data'] = $this->data;
        }

        if ($this->error !== null) {
            $response['error'] = $this->error;
        }

        return $response;
    }

    /**
     * Crea desde array de resultado (compatibilidad)
     * 
     * @param array $result
     * @return self
     */
    public static function fromResult(array $result): self
    {
        return new self(
            success: $result['success'],
            data: $result['data'] ?? null,
            error: isset($result['error']) ? ErrorDTO::fromResult($result) : null,
        );
    }
}