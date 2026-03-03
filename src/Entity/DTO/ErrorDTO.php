<?php

namespace App\Entity\DTO;

/**
 * DTO específico para errores en respuestas API
 * 
 * Estructura:
 * {
 *   "title": string (título del error, e.g. "NOT_FOUND"),
 *   "code": int (código HTTP, e.g. 404),
 *   "message": string (mensaje detallado del error)
 * }
 */
class ErrorDTO implements \JsonSerializable
{
    public function __construct(
        private string $title,
        private int $code,
        private string $message,
    ) {}

    public function jsonSerialize(): array
    {
        return [
            'title' => $this->title,
            'code' => $this->code,
            'message' => $this->message,
        ];
    }

    public static function fromResult(array $result): self
    {
        return new self(
            title: $result['title'],
            code: $result['code'],
            message: $result['message'],
        );
    }

    public function getCode(): int
    {
        return $this->code;
    }
}