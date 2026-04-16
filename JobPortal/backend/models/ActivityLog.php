<?php

require_once __DIR__ . "/../config/database.php";

class ActivityLog {
    private PDO $conn;

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    public function log($userId, string $action, string $details = ""): bool {
        $stmt = $this->conn->prepare("INSERT INTO activity_logs (user_id, action, details, ip_address, user_agent)
                                      VALUES (:user_id, :action, :details, :ip_address, :user_agent)");
        return $stmt->execute([
            ":user_id" => $userId,
            ":action" => $action,
            ":details" => $details,
            ":ip_address" => $_SERVER["REMOTE_ADDR"] ?? null,
            ":user_agent" => $_SERVER["HTTP_USER_AGENT"] ?? null,
        ]);
    }

    public function getAll(int $limit, int $offset, ?string $action = null): array {
        $query = "SELECT * FROM activity_logs";
        $params = [];
        if ($action) {
            $query .= " WHERE action = :action";
            $params[":action"] = $action;
        }
        $query .= " ORDER BY timestamp DESC LIMIT :limit OFFSET :offset";
        $stmt = $this->conn->prepare($query);
        foreach ($params as $k => $v) {
            $stmt->bindValue($k, $v);
        }
        $stmt->bindValue(":limit", $limit, PDO::PARAM_INT);
        $stmt->bindValue(":offset", $offset, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function countAll(?string $action = null): int {
        $query = "SELECT COUNT(*) as total FROM activity_logs";
        $params = [];
        if ($action) {
            $query .= " WHERE action = :action";
            $params[":action"] = $action;
        }
        $stmt = $this->conn->prepare($query);
        $stmt->execute($params);
        return (int) $stmt->fetch()["total"];
    }
}
