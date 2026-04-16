<?php

require_once __DIR__ . "/auth.php";
require_once __DIR__ . "/../helpers/Response.php";

class RoleMiddleware {
    public static function checkRole(array $allowedRoles): array {
        $user = AuthMiddleware::validateToken();
        if (!in_array($user["role"], $allowedRoles, true)) {
            Response::error("Access denied. Insufficient permissions.", 403);
        }
        return $user;
    }
}
