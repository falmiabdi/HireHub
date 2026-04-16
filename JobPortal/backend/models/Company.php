<?php

require_once __DIR__ . "/../config/database.php";

class Company {
    private PDO $conn;

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    public function create(int $userId, array $data): bool {
        $query = "INSERT INTO companies (user_id, company_name, contact_email)
                  VALUES (:user_id, :company_name, :contact_email)";
        $stmt = $this->conn->prepare($query);
        $companyName = $data["company_name"] ?? "";
        $contactEmail = $data["contact_email"] ?? "";
        $stmt->bindParam(":user_id", $userId);
        $stmt->bindParam(":company_name", $companyName);
        $stmt->bindParam(":contact_email", $contactEmail);
        return $stmt->execute();
    }

    public function getByUserId(int $userId) {
        $stmt = $this->conn->prepare("SELECT * FROM companies WHERE user_id = :user_id LIMIT 1");
        $stmt->bindParam(":user_id", $userId);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getVerifiedCompanies(): array {
        $stmt = $this->conn->query("SELECT * FROM companies WHERE verified_status = 'approved' ORDER BY company_name ASC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getById(int $companyId) {
        $stmt = $this->conn->prepare("SELECT * FROM companies WHERE company_id = :company_id LIMIT 1");
        $stmt->execute([":company_id" => $companyId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function update(int $companyId, array $data): bool {
        $allowed = ["company_name", "registration_number", "logo_path", "website", "description", "industry", "company_size", "location", "contact_email", "contact_phone"];
        $sets = [];
        $params = [":company_id" => $companyId];
        foreach ($allowed as $field) {
            if (array_key_exists($field, $data)) {
                $sets[] = "{$field} = :{$field}";
                $params[":{$field}"] = $data[$field];
            }
        }
        if (!$sets) {
            return true;
        }
        $query = "UPDATE companies SET " . implode(", ", $sets) . " WHERE company_id = :company_id";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute($params);
    }

    public function getAll(int $limit, int $offset, ?string $status = null): array {
        $query = "SELECT c.*, u.email FROM companies c LEFT JOIN users u ON c.user_id = u.user_id WHERE 1=1";
        $params = [];
        if ($status) {
            $query .= " AND c.verified_status = :status";
            $params[":status"] = $status;
        }
        $query .= " ORDER BY c.company_id DESC LIMIT :limit OFFSET :offset";
        $stmt = $this->conn->prepare($query);
        foreach ($params as $k => $v) {
            $stmt->bindValue($k, $v);
        }
        $stmt->bindValue(":limit", $limit, PDO::PARAM_INT);
        $stmt->bindValue(":offset", $offset, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function countAll(?string $status = null): int {
        $query = "SELECT COUNT(*) as total FROM companies";
        $params = [];
        if ($status) {
            $query .= " WHERE verified_status = :status";
            $params[":status"] = $status;
        }
        $stmt = $this->conn->prepare($query);
        $stmt->execute($params);
        return (int) $stmt->fetch()["total"];
    }

    public function countPending(): int {
        return $this->countAll("pending");
    }

    public function updateVerificationStatus(int $companyId, string $status): bool {
        $stmt = $this->conn->prepare("UPDATE companies SET verified_status = :status, verified_at = NOW() WHERE company_id = :company_id");
        return $stmt->execute([":status" => $status, ":company_id" => $companyId]);
    }

    public function getTopCompanies(int $limit): array {
        $query = "SELECT c.*, COUNT(j.job_id) as jobs_posted
                  FROM companies c
                  LEFT JOIN jobs j ON c.company_id = j.company_id
                  GROUP BY c.company_id
                  ORDER BY jobs_posted DESC
                  LIMIT :limit";
        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(":limit", $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
