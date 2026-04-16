<?php

require_once __DIR__ . "/../config/database.php";

class User {
    private PDO $conn;
    private string $table = "users";

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    public function create(array $data) {
        $query = "INSERT INTO {$this->table} (email, password_hash, role, verification_token)
                  VALUES (:email, :password, :role, :token)";
        $stmt = $this->conn->prepare($query);

        $passwordHash = password_hash($data["password"], PASSWORD_BCRYPT);
        $verificationToken = bin2hex(random_bytes(32));

        $stmt->bindParam(":email", $data["email"]);
        $stmt->bindParam(":password", $passwordHash);
        $stmt->bindParam(":role", $data["role"]);
        $stmt->bindParam(":token", $verificationToken);

        if ($stmt->execute()) {
            return $this->conn->lastInsertId();
        }
        return false;
    }

    public function findByEmail(string $email) {
        $stmt = $this->conn->prepare("SELECT * FROM {$this->table} WHERE email = :email LIMIT 1");
        $stmt->bindParam(":email", $email);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function updateLastLogin(int $userId): bool {
        $stmt = $this->conn->prepare("UPDATE {$this->table} SET last_login = NOW() WHERE user_id = :id");
        $stmt->bindParam(":id", $userId);
        return $stmt->execute();
    }

    public function updateStatus(int $userId, string $status): bool {
        $stmt = $this->conn->prepare("UPDATE {$this->table} SET status = :status WHERE user_id = :id");
        return $stmt->execute([":status" => $status, ":id" => $userId]);
    }

    public function delete(int $userId): bool {
        $stmt = $this->conn->prepare("DELETE FROM {$this->table} WHERE user_id = :id");
        return $stmt->execute([":id" => $userId]);
    }

    public function countByRole(string $role): int {
        $stmt = $this->conn->prepare("SELECT COUNT(*) as total FROM {$this->table} WHERE role = :role");
        $stmt->execute([":role" => $role]);
        return (int) $stmt->fetch()["total"];
    }

    public function countAll(?string $role = null, ?string $status = null): int {
        $query = "SELECT COUNT(*) as total FROM {$this->table} WHERE 1=1";
        $params = [];
        if ($role) {
            $query .= " AND role = :role";
            $params[":role"] = $role;
        }
        if ($status) {
            $query .= " AND status = :status";
            $params[":status"] = $status;
        }
        $stmt = $this->conn->prepare($query);
        $stmt->execute($params);
        return (int) $stmt->fetch()["total"];
    }

    public function getAll(int $limit = 20, int $offset = 0, ?string $role = null, ?string $status = null): array {
        $query = "SELECT * FROM {$this->table} WHERE 1=1";
        $params = [];
        if ($role) {
            $query .= " AND role = :role";
            $params[":role"] = $role;
        }
        if ($status) {
            $query .= " AND status = :status";
            $params[":status"] = $status;
        }
        $query .= " ORDER BY created_at DESC LIMIT :limit OFFSET :offset";
        $stmt = $this->conn->prepare($query);
        foreach ($params as $k => $v) {
            $stmt->bindValue($k, $v);
        }
        $stmt->bindValue(":limit", $limit, PDO::PARAM_INT);
        $stmt->bindValue(":offset", $offset, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getRecent(int $limit): array {
        $stmt = $this->conn->prepare("SELECT user_id, email, role, status, created_at FROM {$this->table} ORDER BY created_at DESC LIMIT :limit");
        $stmt->bindValue(":limit", $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getRegistrationsByPeriod(string $period): array {
        $groupBy = $period === "week" ? "%Y-%u" : ($period === "day" ? "%Y-%m-%d" : "%Y-%m");
        $stmt = $this->conn->query("SELECT DATE_FORMAT(created_at, '{$groupBy}') as period, COUNT(*) as total FROM {$this->table} GROUP BY period ORDER BY period ASC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
