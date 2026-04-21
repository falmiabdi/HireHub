<?php

require_once __DIR__ . "/../config/database.php";

class Application {
    private PDO $conn;

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    public function create(array $data) {
        $query = "INSERT INTO job_applications
                  (job_id, candidate_id, company_id, cover_letter, resume_used, expected_salary, experience_years, education_level, availability_date, portfolio_url, linkedin_url, status)
                  VALUES
                  (:job_id, :candidate_id, :company_id, :cover_letter, :resume_used, :expected_salary, :experience_years, :education_level, :availability_date, :portfolio_url, :linkedin_url, 'pending')";
        $stmt = $this->conn->prepare($query);
        if ($stmt->execute([
            ":job_id" => $data["job_id"],
            ":candidate_id" => $data["candidate_id"],
            ":company_id" => $data["company_id"],
            ":cover_letter" => $data["cover_letter"] ?? "",
            ":resume_used" => $data["resume_used"] ?? null,
            ":expected_salary" => $data["expected_salary"] ?? null,
            ":experience_years" => $data["experience_years"] ?? null,
            ":education_level" => $data["education_level"] ?? null,
            ":availability_date" => $data["availability_date"] ?? null,
            ":portfolio_url" => $data["portfolio_url"] ?? null,
            ":linkedin_url" => $data["linkedin_url"] ?? null,
        ])) {
            return $this->conn->lastInsertId();
        }
        return false;
    }

    public function hasApplied(int $jobId, int $candidateId): bool {
        $stmt = $this->conn->prepare("SELECT 1 FROM job_applications WHERE job_id = :job_id AND candidate_id = :candidate_id");
        $stmt->execute([":job_id" => $jobId, ":candidate_id" => $candidateId]);
        return (bool) $stmt->fetch();
    }

    public function countCompanyApplications(int $companyId, ?string $status = null): int {
        $query = "SELECT COUNT(*) as total FROM job_applications WHERE company_id = :company_id";
        $params = [":company_id" => $companyId];
        if ($status) {
            $query .= " AND status = :status";
            $params[":status"] = $status;
        }
        $stmt = $this->conn->prepare($query);
        $stmt->execute($params);
        return (int) $stmt->fetch()["total"];
    }

    public function countCompanyPendingApplications(int $companyId): int {
        return $this->countCompanyApplications($companyId, "pending");
    }

    public function getCompanyApplications(int $companyId, ?string $status, int $limit, int $offset): array {
        $query = "SELECT a.*, j.title as job_title, j.job_id, cp.full_name as candidate_name, cp.phone as candidate_phone, u.email as candidate_email, cp.resume_path as candidate_resume
                  FROM job_applications a
                  INNER JOIN jobs j ON a.job_id = j.job_id
                  LEFT JOIN candidate_profiles cp ON a.candidate_id = cp.profile_id
                  LEFT JOIN users u ON a.candidate_id = u.user_id
                  WHERE a.company_id = :company_id";
        $params = [":company_id" => $companyId];
        if ($status) {
            $query .= " AND a.status = :status";
            $params[":status"] = $status;
        }
        $query .= " ORDER BY a.applied_date DESC LIMIT :limit OFFSET :offset";
        $stmt = $this->conn->prepare($query);
        foreach ($params as $k => $v) {
            $stmt->bindValue($k, $v);
        }
        $stmt->bindValue(":limit", $limit, PDO::PARAM_INT);
        $stmt->bindValue(":offset", $offset, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getRecentCompanyApplications(int $companyId, int $limit): array {
        $stmt = $this->conn->prepare("SELECT * FROM job_applications WHERE company_id = :company_id ORDER BY applied_date DESC LIMIT :limit");
        $stmt->bindValue(":company_id", $companyId, PDO::PARAM_INT);
        $stmt->bindValue(":limit", $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getJobApplications(int $jobId): array {
        $stmt = $this->conn->prepare("SELECT * FROM job_applications WHERE job_id = :job_id ORDER BY applied_date DESC");
        $stmt->execute([":job_id" => $jobId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function updateStatus(int $applicationId, string $status, ?string $notes = null): bool {
        $stmt = $this->conn->prepare("UPDATE job_applications SET status = :status, admin_notes = :notes WHERE application_id = :app_id");
        return $stmt->execute([":status" => $status, ":notes" => $notes, ":app_id" => $applicationId]);
    }

    public function belongsToCompany(int $applicationId, int $companyId): bool {
        $stmt = $this->conn->prepare("SELECT 1 FROM job_applications WHERE application_id = :app_id AND company_id = :company_id");
        $stmt->execute([":app_id" => $applicationId, ":company_id" => $companyId]);
        return (bool) $stmt->fetch();
    }

    public function belongsToCandidate(int $applicationId, int $candidateId): bool {
        $stmt = $this->conn->prepare("SELECT 1 FROM job_applications WHERE application_id = :app_id AND candidate_id = :candidate_id");
        $stmt->execute([":app_id" => $applicationId, ":candidate_id" => $candidateId]);
        return (bool) $stmt->fetch();
    }

    public function withdraw(int $applicationId): bool {
        $stmt = $this->conn->prepare("UPDATE job_applications SET status = 'withdrawn' WHERE application_id = :app_id");
        return $stmt->execute([":app_id" => $applicationId]);
    }

    public function getCandidateApplications(int $candidateId, int $limit, int $offset, ?string $status = null): array {
        $query = "SELECT a.*, j.title as job_title, c.company_name
                  FROM job_applications a
                  INNER JOIN jobs j ON a.job_id = j.job_id
                  INNER JOIN companies c ON a.company_id = c.company_id
                  WHERE a.candidate_id = :candidate_id";
        $params = [":candidate_id" => $candidateId];
        if ($status) {
            $query .= " AND a.status = :status";
            $params[":status"] = $status;
        }
        $query .= " ORDER BY a.applied_date DESC LIMIT :limit OFFSET :offset";
        $stmt = $this->conn->prepare($query);
        foreach ($params as $k => $v) {
            $stmt->bindValue($k, $v);
        }
        $stmt->bindValue(":limit", $limit, PDO::PARAM_INT);
        $stmt->bindValue(":offset", $offset, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function countCandidateApplications(int $candidateId, ?string $status = null): int {
        $query = "SELECT COUNT(*) as total FROM job_applications WHERE candidate_id = :candidate_id";
        $params = [":candidate_id" => $candidateId];
        if ($status) {
            $query .= " AND status = :status";
            $params[":status"] = $status;
        }
        $stmt = $this->conn->prepare($query);
        $stmt->execute($params);
        return (int) $stmt->fetch()["total"];
    }

    public function countCandidateApplicationsByStatus(int $candidateId, string $status): int {
        return $this->countCandidateApplications($candidateId, $status);
    }

    public function countAll(): int {
        return (int) $this->conn->query("SELECT COUNT(*) as total FROM job_applications")->fetch()["total"];
    }

    public function getRecent(int $limit): array {
        $stmt = $this->conn->prepare("SELECT * FROM job_applications ORDER BY applied_date DESC LIMIT :limit");
        $stmt->bindValue(":limit", $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getApplicationsByStatus(): array {
        $stmt = $this->conn->query("SELECT status, COUNT(*) as total FROM job_applications GROUP BY status");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
