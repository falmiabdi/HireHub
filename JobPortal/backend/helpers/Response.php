<?php

class Response {
    public static function success($data = null, string $message = "Success", int $status = 200): void {
        http_response_code($status);
        echo json_encode([
            "success" => true,
            "message" => $message,
            "data" => $data,
        ]);
        exit();
    }

    public static function error(string $message = "Error", int $status = 400): void {
        http_response_code($status);
        echo json_encode([
            "success" => false,
            "message" => $message,
        ]);
        exit();
    }
}
