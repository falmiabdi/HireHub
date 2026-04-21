<?php
require_once __DIR__ . '/../../config/cors.php';
header('Content-Type: application/json; charset=UTF-8');
require_once __DIR__ . "/../../config/jwt.php";
require_once __DIR__ . "/../../helpers/Response.php";
require_once __DIR__ . "/../../helpers/Validation.php";
require_once __DIR__ . "/../../models/User.php";
require_once __DIR__ . "/../../models/CandidateProfile.php";
require_once __DIR__ . "/../../models/Company.php";

class AuthAPI {
    private User $userModel;
    private CandidateProfile $candidateModel;
    private Company $companyModel;

    public function __construct() {
        $this->userModel = new User();
        $this->candidateModel = new CandidateProfile();
        $this->companyModel = new Company();
    }

    public function handleRequest(): void {
        $method = $_SERVER["REQUEST_METHOD"];
        $action = $_GET["action"] ?? "";

        if ($method !== "POST") {
            Response::error("Method not allowed", 405);
        }

        switch ($action) {
            case "register":
                $this->register();
                break;
            case "login":
                $this->login();
                break;
            case "logout":
                Response::success(null, "Logged out successfully");
                break;
            case "refresh":
                Response::success(["access_token" => ""], "Token refreshed");
                break;
            default:
                Response::error("Invalid action", 400);
        }
    }

    private function register(): void {
        $data = json_decode(file_get_contents("php://input"), true) ?? [];
        if (!Validation::requireFields($data, ["email", "password", "role"])) {
            Response::error("Missing required fields", 400);
        }
        if (!Validation::validEmail($data["email"])) {
            Response::error("Invalid email format", 400);
        }

        $existingUser = $this->userModel->findByEmail($data["email"]);
        if ($existingUser) {
            Response::error("Email already registered", 409);
        }

        $userId = $this->userModel->create($data);
        if (!$userId) {
            Response::error("Registration failed", 500);
        }

        if ($data["role"] === "candidate") {
            $this->candidateModel->create((int) $userId, [
                "full_name" => $data["full_name"] ?? "",
                "phone" => $data["phone"] ?? "",
            ]);
        }
        if ($data["role"] === "company") {
            $this->companyModel->create((int) $userId, [
                "company_name" => $data["company_name"] ?? "",
                "contact_email" => $data["email"],
            ]);
        }

        Response::success(["user_id" => (int) $userId, "role" => $data["role"]], "Registration successful");
    }

    private function login(): void {
        $data = json_decode(file_get_contents("php://input"), true) ?? [];
        if (!Validation::requireFields($data, ["email", "password"])) {
            Response::error("Email and password required", 400);
        }

        $user = $this->userModel->findByEmail($data["email"]);
        if (!$user || !password_verify($data["password"], $user["password_hash"])) {
            Response::error("Invalid credentials", 401);
        }
        if ($user["status"] !== "active") {
            Response::error("Account is " . $user["status"], 403);
        }

        $this->userModel->updateLastLogin((int) $user["user_id"]);
        $accessToken = $this->generateJWT((int) $user["user_id"], $user["email"], $user["role"]);
        $refreshToken = bin2hex(random_bytes(32));

        $profile = null;
        if ($user["role"] === "candidate") {
            $profile = $this->candidateModel->getByUserId((int) $user["user_id"]);
        }
        if ($user["role"] === "company") {
            $profile = $this->companyModel->getByUserId((int) $user["user_id"]);
        }

        Response::success([
            "access_token" => $accessToken,
            "refresh_token" => $refreshToken,
            "user" => [
                "id" => (int) $user["user_id"],
                "email" => $user["email"],
                "role" => $user["role"],
                "status" => $user["status"],
                "profile_image" => $user["profile_image"] ?? null,
                "profile" => $profile,
            ],
        ], "Login successful");
    }

    private function generateJWT(int $userId, string $email, string $role): string {
        $payload = [
            "user_id" => $userId,
            "email" => $email,
            "role" => $role,
            "iat" => time(),
            "exp" => time() + JWTConfig::getExpireTime(),
            "iss" => JWTConfig::$issuer,
        ];

        $header = json_encode(["typ" => "JWT", "alg" => "HS256"]);
        $payloadEncoded = json_encode($payload);
        $base64Header = rtrim(strtr(base64_encode($header), "+/", "-_"), "=");
        $base64Payload = rtrim(strtr(base64_encode($payloadEncoded), "+/", "-_"), "=");
        $signature = hash_hmac("sha256", "$base64Header.$base64Payload", JWTConfig::getSecretKey(), true);
        $base64Signature = rtrim(strtr(base64_encode($signature), "+/", "-_"), "=");
        return "$base64Header.$base64Payload.$base64Signature";
    }
}

$api = new AuthAPI();
$api->handleRequest();
