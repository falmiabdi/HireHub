<?php

require_once __DIR__ . "/../config/database.php";

class Job {
    private PDO $conn;
    private string $table = "jobs";

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    public function getPublicJobs(int $limit = 20, int $offset = 0, array $filters = []): array {
        $query = "SELECT j.*, c.company_name, c.logo_path
                  FROM {$this->table} j
                  INNER JOIN companies c ON j.company_id = c.company_id
                  WHERE j.status = 'open' AND j.approval_status = 'approved'";

        if (!empty($filters["search"])) {
            $query .= " AND MATCH(j.title, j.description, j.requirements) AGAINST(:search IN NATURAL LANGUAGE MODE)";
        }
        if (!empty($filters["location"])) {
            $query .= " AND j.location LIKE :location";
        }

        $query .= " ORDER BY j.is_featured DESC, j.posted_date DESC LIMIT :limit OFFSET :offset";
        $stmt = $this->conn->prepare($query);

        if (!empty($filters["search"])) {
            $stmt->bindParam(":search", $filters["search"]);
        }
        if (!empty($filters["location"])) {
            $location = "%" . $filters["location"] . "%";
            $stmt->bindParam(":location", $location);
        }

        $stmt->bindParam(":limit", $limit, PDO::PARAM_INT);
        $stmt->bindParam(":offset", $offset, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getJobById(int $jobId, bool $requireApproved = true) {
        $query = "SELECT j.*, c.company_name, c.logo_path, c.website
                  FROM {$this->table} j
                  INNER JOIN companies c ON j.company_id = c.company_id
                  WHERE j.job_id = :job_id";
        if ($requireApproved) {
            $query .= " AND j.approval_status = 'approved'";
        }
        $query .= " LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":job_id", $jobId);
        $stmt->execute();
        $job = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($job) {
            $this->incrementViews($jobId);
        }
        return $job;
    }

    public function searchJobs(string $keyword, string $location = ""): array {
        return $this->getPublicJobs(20, 0, [
            "search" => $keyword,
            "location" => $location,
        ]);
    }

    public function create(array $data) {
        $query = "INSERT INTO {$this->table}
                  (company_id, title, description, requirements, location, job_type, experience_level,
                   salary_min, salary_max, skills_required, benefits, deadline, approval_status)
                  VALUES
                  (:company_id, :title, :description, :requirements, :location, :job_type, :experience_level,
                   :salary_min, :salary_max, :skills_required, :benefits, :deadline, 'pending')";
        $stmt = $this->conn->prepare($query);
        if ($stmt->execute([
            ":company_id" => $data["company_id"],
            ":title" => $data["title"],
            ":description" => $data["description"],
            ":requirements" => $data["requirements"] ?? "",
            ":location" => $data["location"] ?? "",
            ":job_type" => $data["job_type"] ?? "full-time",
            ":experience_level" => $data["experience_level"] ?? "entry",
            ":salary_min" => $data["salary_min"] ?? null,
            ":salary_max" => $data["salary_max"] ?? null,
            ":skills_required" => $data["skills_required"] ?? "",
            ":benefits" => $data["benefits"] ?? "",
            ":deadline" => $data["deadline"] ?? null,
        ])) {
            return $this->conn->lastInsertId();
        }
        return false;
    }

    public function getPendingJobs(int $limit = 20, int $offset = 0): array {
        $query = "SELECT j.*, c.company_name, c.logo_path, u.email as company_email
                  FROM {$this->table} j
                  INNER JOIN companies c ON j.company_id = c.company_id
                  INNER JOIN users u ON c.user_id = u.user_id
                  WHERE j.approval_status = 'pending'
                  ORDER BY j.posted_date DESC
                  LIMIT :limit OFFSET :offset";
        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(":limit", $limit, PDO::PARAM_INT);
        $stmt->bindValue(":offset", $offset, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function countPending(): int {
        $stmt = $this->conn->prepare("SELECT COUNT(*) as total FROM {$this->table} WHERE approval_status = 'pending'");
        $stmt->execute();
        return (int) $stmt->fetch()["total"];
    }

    public function approveJob(int $jobId, int $adminId): bool {
        $stmt = $this->conn->prepare("UPDATE {$this->table} 
                  SET approval_status = 'approved', approved_by = :admin_id, approved_at = NOW() 
                  WHERE job_id = :job_id");
        return $stmt->execute([":job_id" => $jobId, ":admin_id" => $adminId]);
    }

    public function rejectJob(int $jobId, int $adminId, string $reason): bool {
        $stmt = $this->conn->prepare("UPDATE {$this->table} 
                  SET approval_status = 'rejected', approved_by = :admin_id, approved_at = NOW(), rejection_reason = :reason 
                  WHERE job_id = :job_id");
        return $stmt->execute([":job_id" => $jobId, ":admin_id" => $adminId, ":reason" => $reason]);
    }

    public function update(int $jobId, int $companyId, array $data): bool {
        $query = "UPDATE {$this->table}
                  SET title = :title, description = :description, requirements = :requirements, location = :location,
                      job_type = :job_type, experience_level = :experience_level, salary_min = :salary_min,
                      salary_max = :salary_max, skills_required = :skills_required, benefits = :benefits, deadline = :deadline
                  WHERE job_id = :job_id AND company_id = :company_id";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([
            ":title" => $data["title"] ?? "",
            ":description" => $data["description"] ?? "",
            ":requirements" => $data["requirements"] ?? "",
            ":location" => $data["location"] ?? "",
            ":job_type" => $data["job_type"] ?? "full-time",
            ":experience_level" => $data["experience_level"] ?? "entry",
            ":salary_min" => $data["salary_min"] ?? null,
            ":salary_max" => $data["salary_max"] ?? null,
            ":skills_required" => $data["skills_required"] ?? "",
            ":benefits" => $data["benefits"] ?? "",
            ":deadline" => $data["deadline"] ?? null,
            ":job_id" => $jobId,
            ":company_id" => $companyId,
        ]);
    }

    public function delete(int $jobId, ?int $companyId = null): bool {
        $query = "DELETE FROM {$this->table} WHERE job_id = :job_id";
        $params = [":job_id" => $jobId];
        if ($companyId !== null) {
            $query .= " AND company_id = :company_id";
            $params[":company_id"] = $companyId;
        }
        $stmt = $this->conn->prepare($query);
        return $stmt->execute($params);
    }

    public function belongsToCompany(int $jobId, int $companyId): bool {
        $stmt = $this->conn->prepare("SELECT 1 FROM {$this->table} WHERE job_id = :job_id AND company_id = :company_id");
        $stmt->execute([":job_id" => $jobId, ":company_id" => $companyId]);
        return (bool) $stmt->fetch();
    }

    public function getCompanyJobs(int $companyId, int $limit = 20, int $offset = 0): array {
        $query = "SELECT * FROM {$this->table} WHERE company_id = :company_id ORDER BY posted_date DESC LIMIT :limit OFFSET :offset";
        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(":company_id", $companyId, PDO::PARAM_INT);
        $stmt->bindValue(":limit", $limit, PDO::PARAM_INT);
        $stmt->bindValue(":offset", $offset, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function countCompanyJobs(int $companyId): int {
        $stmt = $this->conn->prepare("SELECT COUNT(*) as total FROM {$this->table} WHERE company_id = :company_id");
        $stmt->execute([":company_id" => $companyId]);
        return (int) $stmt->fetch()["total"];
    }

    public function countCompanyActiveJobs(int $companyId): int {
        $stmt = $this->conn->prepare("SELECT COUNT(*) as total FROM {$this->table} WHERE company_id = :company_id AND status = 'open'");
        $stmt->execute([":company_id" => $companyId]);
        return (int) $stmt->fetch()["total"];
    }

    public function saveJob(int $candidateId, int $jobId): bool {
        $stmt = $this->conn->prepare("INSERT IGNORE INTO saved_jobs (candidate_id, job_id) VALUES (:candidate_id, :job_id)");
        return $stmt->execute([":candidate_id" => $candidateId, ":job_id" => $jobId]);
    }

    public function unsaveJob(int $candidateId, int $jobId): bool {
        $stmt = $this->conn->prepare("DELETE FROM saved_jobs WHERE candidate_id = :candidate_id AND job_id = :job_id");
        return $stmt->execute([":candidate_id" => $candidateId, ":job_id" => $jobId]);
    }

    public function getSavedJobs(int $candidateId, int $limit, int $offset): array {
        $query = "SELECT j.* FROM saved_jobs s
                  INNER JOIN {$this->table} j ON s.job_id = j.job_id
                  WHERE s.candidate_id = :candidate_id
                  ORDER BY s.saved_date DESC
                  LIMIT :limit OFFSET :offset";
        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(":candidate_id", $candidateId, PDO::PARAM_INT);
        $stmt->bindValue(":limit", $limit, PDO::PARAM_INT);
        $stmt->bindValue(":offset", $offset, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function countSavedJobs(int $candidateId): int {
        $stmt = $this->conn->prepare("SELECT COUNT(*) as total FROM saved_jobs WHERE candidate_id = :candidate_id");
        $stmt->execute([":candidate_id" => $candidateId]);
        return (int) $stmt->fetch()["total"];
    }

    public function getRecommendedJobs(int $candidateId, int $limit): array {
        $stmt = $this->conn->prepare("SELECT * FROM {$this->table} WHERE status = 'open' AND approval_status = 'approved' ORDER BY posted_date DESC LIMIT :limit");
        $stmt->bindValue(":limit", $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function countAll(?string $status = null): int {
        $query = "SELECT COUNT(*) as total FROM {$this->table}";
        $params = [];
        if ($status) {
            $query .= " WHERE status = :status";
            $params[":status"] = $status;
        }
        $stmt = $this->conn->prepare($query);
        $stmt->execute($params);
        return (int) $stmt->fetch()["total"];
    }

    public function countActive(): int {
        $stmt = $this->conn->prepare("SELECT COUNT(*) as total FROM {$this->table} WHERE status = 'open' AND approval_status = 'approved'");
        $stmt->execute();
        return (int) $stmt->fetch()["total"];
    }

    public function getRecent(int $limit): array {
        $stmt = $this->conn->prepare("SELECT * FROM {$this->table} ORDER BY posted_date DESC LIMIT :limit");
        $stmt->bindValue(":limit", $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getAllJobs(int $limit, int $offset, ?string $status = null, ?string $approvalStatus = null): array {
        $query = "SELECT j.*, c.company_name FROM {$this->table} j
                  LEFT JOIN companies c ON j.company_id = c.company_id
                  WHERE 1=1";
        $params = [];
        if ($status) {
            $query .= " AND j.status = :status";
            $params[":status"] = $status;
        }
        if ($approvalStatus) {
            $query .= " AND j.approval_status = :approval_status";
            $params[":approval_status"] = $approvalStatus;
        }
        $query .= " ORDER BY j.posted_date DESC LIMIT :limit OFFSET :offset";
        $stmt = $this->conn->prepare($query);
        foreach ($params as $k => $v) {
            $stmt->bindValue($k, $v);
        }
        $stmt->bindValue(":limit", $limit, PDO::PARAM_INT);
        $stmt->bindValue(":offset", $offset, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function countByApprovalStatus(string $approvalStatus): int {
        $stmt = $this->conn->prepare("SELECT COUNT(*) as total FROM {$this->table} WHERE approval_status = :approval_status");
        $stmt->execute([":approval_status" => $approvalStatus]);
        return (int) $stmt->fetch()["total"];
    }

    public function getJobsByType(): array {
        return $this->conn->query("SELECT job_type, COUNT(*) as total FROM {$this->table} GROUP BY job_type")->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getJobsByLocation(): array {
        return $this->conn->query("SELECT location, COUNT(*) as total FROM {$this->table} GROUP BY location ORDER BY total DESC")->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getTopJobs(int $limit): array {
        $stmt = $this->conn->prepare("SELECT * FROM {$this->table} ORDER BY views_count DESC LIMIT :limit");
        $stmt->bindValue(":limit", $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    private function incrementViews(int $jobId): void {
        $stmt = $this->conn->prepare("UPDATE {$this->table} SET views_count = views_count + 1 WHERE job_id = :job_id");
        $stmt->bindParam(":job_id", $jobId);
        $stmt->execute();
    }
}
