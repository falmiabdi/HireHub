<?php

require_once __DIR__ . "/../config/database.php";

class CandidateProfile {
    private PDO $conn;

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    public function create(int $userId, array $data) {
        $query = "INSERT INTO candidate_profiles (user_id, full_name, phone)
                  VALUES (:user_id, :full_name, :phone)";
        $stmt = $this->conn->prepare($query);
        $fullName = $data["full_name"] ?? "";
        $phone = $data["phone"] ?? null;
        $stmt->bindParam(":user_id", $userId);
        $stmt->bindParam(":full_name", $fullName);
        $stmt->bindParam(":phone", $phone);
        if ($stmt->execute()) {
            return (int) $this->conn->lastInsertId();
        }
        return false;
    }

    public function getByUserId(int $userId) {
        $stmt = $this->conn->prepare("SELECT * FROM candidate_profiles WHERE user_id = :user_id LIMIT 1");
        $stmt->bindParam(":user_id", $userId);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function update(int $profileId, array $data): bool {
        $allowed = ["full_name", "phone", "country", "address", "field", "experience", "education", "gender", "summary", "skills", "resume_path", "profile_image", "profile_picture", "expected_salary", "experience_years", "education_level", "availability_date", "portfolio_url", "linkedin_url"];
        $sets = [];
        $params = [":profile_id" => $profileId];
        foreach ($allowed as $field) {
            if (array_key_exists($field, $data)) {
                $sets[] = "{$field} = :{$field}";
                $params[":{$field}"] = $data[$field];
            }
        }
        if (!$sets) {
            return true;
        }
        $query = "UPDATE candidate_profiles SET " . implode(", ", $sets) . " WHERE profile_id = :profile_id";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute($params);
    }
}
