<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../models/User.php';
require_once __DIR__ . '/../../models/CandidateProfile.php';
require_once __DIR__ . '/../../models/Job.php';
require_once __DIR__ . '/../../models/Application.php';
require_once __DIR__ . '/../../models/ActivityLog.php';

class CandidateAPI {
    private User $user_model;
    private CandidateProfile $candidate_model;
    private Job $job_model;
    private Application $application_model;
    private ActivityLog $activity_model;
    private int $candidate_id;
    private int $user_id;

    public function __construct() {
        $this->user_model = new User();
        $this->candidate_model = new CandidateProfile();
        $this->job_model = new Job();
        $this->application_model = new Application();
        $this->activity_model = new ActivityLog();

        $user = AuthMiddleware::validateToken();
        if ($user['role'] !== 'candidate') {
            $this->sendError('Access denied. Candidate role required.', 403);
        }

        $this->user_id = (int) $user['user_id'];
        $candidate = $this->candidate_model->getByUserId($this->user_id);
        if (!$candidate) {
            $this->candidate_id = (int) $this->candidate_model->create($this->user_id, []);
        } else {
            $this->candidate_id = (int) $candidate['profile_id'];
        }
    }

    public function handleRequest(): void {
        $method = $_SERVER['REQUEST_METHOD'];
        $action = $_GET['action'] ?? '';

        switch ($method) {
            case 'GET':
                if ($action === 'dashboard') $this->getDashboard();
                elseif ($action === 'my_applications') $this->getMyApplications();
                elseif ($action === 'saved_jobs') $this->getSavedJobs();
                elseif ($action === 'profile') $this->getProfile();
                elseif ($action === 'job_recommendations') $this->getJobRecommendations();
                else $this->sendError('Invalid action', 400);
                break;
            case 'POST':
                if ($action === 'apply') $this->applyForJob();
                elseif ($action === 'save_job') $this->saveJob();
                elseif ($action === 'upload_resume') $this->uploadResume();
                elseif ($action === 'upload_profile_image') $this->uploadProfileImage();
                else $this->sendError('Invalid action', 400);
                break;
            case 'PUT':
                if ($action === 'update_profile') $this->updateProfile();
                elseif ($action === 'update_application') $this->updateApplication();
                else $this->sendError('Invalid action', 400);
                break;
            case 'DELETE':
                if ($action === 'unsave_job') $this->unsaveJob();
                elseif ($action === 'withdraw_application') $this->withdrawApplication();
                else $this->sendError('Invalid action', 400);
                break;
            default:
                $this->sendError('Method not allowed', 405);
        }
    }

    private function getDashboard(): void {
        $stats = [
            'total_applications' => $this->application_model->countCandidateApplications($this->candidate_id),
            'pending_applications' => $this->application_model->countCandidateApplicationsByStatus($this->candidate_id, 'pending'),
            'shortlisted_applications' => $this->application_model->countCandidateApplicationsByStatus($this->candidate_id, 'shortlisted'),
            'rejected_applications' => $this->application_model->countCandidateApplicationsByStatus($this->candidate_id, 'rejected'),
            'saved_jobs_count' => $this->job_model->countSavedJobs($this->candidate_id),
            'recent_applications' => $this->application_model->getCandidateApplications($this->candidate_id, 10, 0),
            'recommended_jobs' => $this->job_model->getRecommendedJobs($this->candidate_id, 5),
        ];
        $this->sendSuccess($stats);
    }
    private function applyForJob(): void {
        $job_id = isset($_GET['job_id']) ? (int) $_GET['job_id'] : 0;
        if (!$job_id) $this->sendError('Job ID required', 400);
        if ($this->application_model->hasApplied($job_id, $this->candidate_id)) $this->sendError('You have already applied for this job', 400);
        $data = json_decode(file_get_contents("php://input"), true) ?? [];
        $companyId = $this->getCompanyIdFromJob($job_id);
        if (!$companyId) $this->sendError('Invalid job', 404);

        $application_id = $this->application_model->create([
            'job_id' => $job_id,
            'candidate_id' => $this->candidate_id,
            'company_id' => $companyId,
            'cover_letter' => $data['cover_letter'] ?? '',
            'expected_salary' => $data['expected_salary'] ?? null,
            'resume_used' => $data['resume_used'] ?? null,
            'experience_years' => $data['experience_years'] ?? null,
            'education_level' => $data['education_level'] ?? null,
            'availability_date' => $data['availability_date'] ?? null,
            'portfolio_url' => $data['portfolio_url'] ?? null,
            'linkedin_url' => $data['linkedin_url'] ?? null,
        ]);

        if ($application_id) {
            $this->activity_model->log($this->user_id, 'job_applied', "Applied for job ID: $job_id");
            $this->sendSuccess(['application_id' => $application_id], 'Application submitted successfully');
        }
        $this->sendError('Failed to submit application', 500);
    }

    private function getMyApplications(): void {
        $status = $_GET['status'] ?? null;
        $page = isset($_GET['page']) ? (int) $_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int) $_GET['limit'] : 20;
        $offset = ($page - 1) * $limit;
        $applications = $this->application_model->getCandidateApplications($this->candidate_id, $limit, $offset, $status);
        $total = $this->application_model->countCandidateApplications($this->candidate_id, $status);
        $this->sendSuccess(compact('applications', 'total', 'page', 'limit'));
    }

    private function saveJob(): void {
        $job_id = isset($_GET['job_id']) ? (int) $_GET['job_id'] : 0;
        if (!$job_id) $this->sendError('Job ID required', 400);
        if ($this->job_model->saveJob($this->candidate_id, $job_id)) $this->sendSuccess(null, 'Job saved successfully');
        $this->sendError('Failed to save job', 500);
    }

    private function unsaveJob(): void {
        $job_id = isset($_GET['job_id']) ? (int) $_GET['job_id'] : 0;
        if (!$job_id) $this->sendError('Job ID required', 400);
        if ($this->job_model->unsaveJob($this->candidate_id, $job_id)) $this->sendSuccess(null, 'Job removed from saved');
        $this->sendError('Failed to remove saved job', 500);
    }

    private function getSavedJobs(): void {
        $page = isset($_GET['page']) ? (int) $_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int) $_GET['limit'] : 20;
        $offset = ($page - 1) * $limit;
        $jobs = $this->job_model->getSavedJobs($this->candidate_id, $limit, $offset);
        $total = $this->job_model->countSavedJobs($this->candidate_id);
        $this->sendSuccess(compact('jobs', 'total', 'page', 'limit'));
    }

    private function getProfile(): void {
        $profile = $this->candidate_model->getByUserId($this->user_id);
        if ($profile && isset($profile['profile_image'])) {
            $profile['profile_image'] = $profile['profile_image'];
        }
        $this->sendSuccess(['profile' => $profile]);
    }

    private function updateProfile(): void {
        $data = json_decode(file_get_contents("php://input"), true) ?? [];
        if ($this->candidate_model->update($this->candidate_id, $data)) {
            $this->activity_model->log($this->user_id, 'profile_updated', 'Updated candidate profile');
            $this->sendSuccess(null, 'Profile updated successfully');
        }
        $this->sendError('Failed to update profile', 500);
    }

    private function uploadResume(): void {
        if (!isset($_FILES['resume']) || $_FILES['resume']['error'] !== UPLOAD_ERR_OK) $this->sendError('No file uploaded or upload error', 400);
        $allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!in_array($_FILES['resume']['type'], $allowed, true)) $this->sendError('Only PDF and DOC files are allowed', 400);
        $upload_dir = __DIR__ . '/../../uploads/resumes/';
        if (!file_exists($upload_dir)) mkdir($upload_dir, 0777, true);
        $extension = pathinfo($_FILES['resume']['name'], PATHINFO_EXTENSION);
        $filename = 'resume_' . $this->candidate_id . '_' . time() . '.' . $extension;
        $filepath = $upload_dir . $filename;
        if (move_uploaded_file($_FILES['resume']['tmp_name'], $filepath)) {
            $resume_path = '/uploads/resumes/' . $filename;
            $this->candidate_model->update($this->candidate_id, ['resume_path' => $resume_path]);
            $this->sendSuccess(['resume_path' => $resume_path], 'Resume uploaded successfully');
        }
        $this->sendError('Failed to upload file', 500);
    }

    private function uploadProfileImage(): void {
        if (!isset($_FILES['profile_image']) || $_FILES['profile_image']['error'] !== UPLOAD_ERR_OK) {
            $this->sendError('No file uploaded or upload error', 400);
        }
        $allowed_types = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        if (!in_array($_FILES['profile_image']['type'], $allowed_types, true)) {
            $this->sendError('Only JPEG, PNG, and WebP images are allowed', 400);
        }
        $max_size = 5 * 1024 * 1024; // 5MB
        if ($_FILES['profile_image']['size'] > $max_size) {
            $this->sendError('File size exceeds 5MB limit', 400);
        }
        $upload_dir = __DIR__ . '/../../uploads/profile_images/';
        if (!file_exists($upload_dir)) mkdir($upload_dir, 0777, true);
        $extension = pathinfo($_FILES['profile_image']['name'], PATHINFO_EXTENSION);
        $filename = 'candidate_' . $this->candidate_id . '_' . time() . '.' . $extension;
        $filepath = $upload_dir . $filename;
        if (move_uploaded_file($_FILES['profile_image']['tmp_name'], $filepath)) {
            $profile_image = '/uploads/profile_images/' . $filename;
            $this->candidate_model->update($this->candidate_id, ['profile_image' => $profile_image]);
            $this->sendSuccess(['profile_image' => $profile_image], 'Profile image uploaded successfully');
        }
        $this->sendError('Failed to upload file', 500);
    }

    private function updateApplication(): void {
        $application_id = isset($_GET['application_id']) ? (int) $_GET['application_id'] : 0;
        if (!$application_id) $this->sendError('Application ID required', 400);
        
        // Check if application belongs to this candidate
        if (!$this->application_model->belongsToCandidate($application_id, $this->candidate_id)) {
            $this->sendError('Application not found', 404);
        }
        
        // Check if application can be updated (within 4 hours)
        $stmt = $this->conn->prepare("SELECT applied_at FROM job_applications WHERE application_id = ?");
        $stmt->execute([$application_id]);
        $application = $stmt->fetch();
        
        if (!$application) {
            $this->sendError('Application not found', 404);
        }
        
        $applied_at = new DateTime($application['applied_at']);
        $now = new DateTime();
        $interval = $now->diff($applied_at);
        $hours = $interval->h + ($interval->days * 24);
        
        if ($hours > 4) {
            $this->sendError('Applications can only be updated within 4 hours of submission', 403);
        }
        
        $data = json_decode(file_get_contents("php://input"), true) ?? [];
        $updateData = [];
        
        if (isset($data['cover_letter'])) {
            $updateData['cover_letter'] = $data['cover_letter'];
        }
        if (isset($data['expected_salary'])) {
            $updateData['expected_salary'] = $data['expected_salary'];
        }
        
        if (empty($updateData)) {
            $this->sendError('No data to update', 400);
        }
        
        $stmt = $this->conn->prepare("UPDATE job_applications SET cover_letter = COALESCE(:cover_letter, cover_letter), expected_salary = COALESCE(:expected_salary, expected_salary) WHERE application_id = :application_id");
        $stmt->execute([
            ':cover_letter' => $updateData['cover_letter'] ?? null,
            ':expected_salary' => $updateData['expected_salary'] ?? null,
            ':application_id' => $application_id
        ]);
        
        $this->sendSuccess(null, 'Application updated successfully');
    }

    private function withdrawApplication(): void {
        $application_id = isset($_GET['application_id']) ? (int) $_GET['application_id'] : 0;
        if (!$application_id) $this->sendError('Application ID required', 400);
        if (!$this->application_model->belongsToCandidate($application_id, $this->candidate_id)) $this->sendError('Unauthorized', 403);
        if ($this->application_model->withdraw($application_id)) {
            $this->activity_model->log($this->user_id, 'application_withdrawn', "Withdrew application ID: $application_id");
            $this->sendSuccess(null, 'Application withdrawn successfully');
        }
        $this->sendError('Failed to withdraw application', 500);
    }

    private function getJobRecommendations(): void {
        $limit = isset($_GET['limit']) ? (int) $_GET['limit'] : 10;
        $this->sendSuccess(['jobs' => $this->job_model->getRecommendedJobs($this->candidate_id, $limit)]);
    }

    private function getCompanyIdFromJob(int $job_id): ?int {
        $job = $this->job_model->getJobById($job_id);
        return $job ? (int) $job['company_id'] : null;
    }

    private function sendSuccess($data, string $message = 'Success'): void {
        echo json_encode(['success' => true, 'message' => $message, 'data' => $data]);
        exit();
    }

    private function sendError(string $message, int $code = 400): void {
        http_response_code($code);
        echo json_encode(['success' => false, 'message' => $message]);
        exit();
    }
}

$api = new CandidateAPI();
$api->handleRequest();
