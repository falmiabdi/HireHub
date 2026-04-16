<?php

require_once __DIR__ . "/../config/jwt.php";
require_once __DIR__ . "/../helpers/Response.php";

class AuthMiddleware {
    public static function validateToken(): array {
        $headers = getallheaders();
        $authHeader = $headers["Authorization"] ?? "";

        if (!$authHeader) {
            Response::error("No token provided", 401);
        }

        $token = str_replace("Bearer ", "", $authHeader);

        try {
            return self::verifyJWT($token);
        } catch (Exception $e) {
            Response::error("Invalid or expired token", 401);
        }
    }

    private static function verifyJWT(string $token): array {
        $parts = explode(".", $token);
        if (count($parts) !== 3) {
            throw new Exception("Invalid token format");
        }

        [$header, $payload, $signature] = $parts;
        $validSignature = hash_hmac("sha256", "$header.$payload", JWTConfig::getSecretKey(), true);
        $validSignatureBase64 = rtrim(strtr(base64_encode($validSignature), "+/", "-_"), "=");

        if ($signature !== $validSignatureBase64) {
            throw new Exception("Invalid signature");
        }

        $payloadData = json_decode(base64_decode($payload), true);
        if (!isset($payloadData["exp"]) || $payloadData["exp"] < time()) {
            throw new Exception("Token expired");
        }

        return $payloadData;
    }
}
