<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../models/User.php';
require_once __DIR__ . '/../../models/Company.php';
require_once __DIR__ . '/../../models/Job.php';
require_once __DIR__ . '/../../models/Application.php';
require_once __DIR__ . '/../../models/ActivityLog.php';

class CompanyAPI {
    private User $user_model;
    private Company $company_model;
    private Job $job_model;
    private Application $application_model;
    private ActivityLog $activity_model;
    private int $company_id;

    public function __construct() {
        $this->user_model = new User();
        $this->company_model = new Company();
        $this->job_model = new Job();
        $this->application_model = new Application();
        $this->activity_model = new ActivityLog();

        $user = AuthMiddleware::validateToken();
        if ($user['role'] !== 'company') {
            $this->sendError('Access denied. Company role required.', 403);
        }

        $company = $this->company_model->getByUserId((int) $user['user_id']);
        if (!$company) {
            $this->sendError('Company profile not found', 404);
        }

        $this->company_id = (int) $company['company_id'];
    }

    public function handleRequest(): void {
        $method = $_SERVER['REQUEST_METHOD'];
        $action = $_GET['action'] ?? '';

        switch ($method) {
            case 'GET':
                if ($action === 'dashboard') $this->getDashboard();
                elseif ($action === 'my_jobs') $this->getMyJobs();
                elseif ($action === 'applications') $this->getApplications();
                elseif ($action === 'profile') $this->getProfile();
                elseif ($action === 'job_applications') $this->getJobApplications();
                else $this->sendError('Invalid action', 400);
                break;
            case 'POST':
                if ($action === 'post_job') $this->postJob();
                elseif ($action === 'update_application_status') $this->updateApplicationStatus();
                elseif ($action === 'upload_logo') $this->uploadLogo();
                elseif ($action === 'send_message') $this->sendMessage();
                else $this->sendError('Invalid action', 400);
                break;
            case 'PUT':
                if ($action === 'update_job') $this->updateJob();
                elseif ($action === 'update_profile') $this->updateProfile();
                else $this->sendError('Invalid action', 400);
                break;
            case 'DELETE':
                if ($action === 'delete_job') $this->deleteJob();
                else $this->sendError('Invalid action', 400);
                break;
            default:
                $this->sendError('Method not allowed', 405);
        }
    }

    private function getDashboard(): void {
        $stats = [
            'total_jobs' => $this->job_model->countCompanyJobs($this->company_id),
            'active_jobs' => $this->job_model->countCompanyActiveJobs($this->company_id),
            'total_applications' => $this->application_model->countCompanyApplications($this->company_id),
            'pending_applications' => $this->application_model->countCompanyPendingApplications($this->company_id),
            'recent_applications' => $this->application_model->getRecentCompanyApplications($this->company_id, 10),
            'recent_jobs' => $this->job_model->getCompanyJobs($this->company_id, 5, 0),
        ];
        $this->sendSuccess($stats);
    }

    private function getMyJobs(): void {
        $page = isset($_GET['page']) ? (int) $_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int) $_GET['limit'] : 20;
        $offset = ($page - 1) * $limit;
        $jobs = $this->job_model->getCompanyJobs($this->company_id, $limit, $offset);
        $total = $this->job_model->countCompanyJobs($this->company_id);
        $this->sendSuccess(compact('jobs', 'total', 'page', 'limit'));
    }

    private function postJob(): void {
        $data = json_decode(file_get_contents("php://input"), true) ?? [];
        foreach (['title', 'description', 'location', 'job_type', 'experience_level'] as $field) {
            if (empty($data[$field])) $this->sendError("$field is required", 400);
        }
        $data['company_id'] = $this->company_id;
        $job_id = $this->job_model->create($data);
        if ($job_id) {
            $this->activity_model->log($this->company_id, 'job_posted', "Posted new job: {$data['title']}");
            $this->sendSuccess(['job_id' => $job_id], 'Job posted successfully');
        }
        $this->sendError('Failed to post job', 500);
    }

    private function updateJob(): void {
        $job_id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
        if (!$job_id) $this->sendError('Job ID required', 400);
        if (!$this->job_model->belongsToCompany($job_id, $this->company_id)) $this->sendError('Unauthorized', 403);
        $data = json_decode(file_get_contents("php://input"), true) ?? [];
        if ($this->job_model->update($job_id, $this->company_id, $data)) {
            $this->activity_model->log($this->company_id, 'job_updated', "Updated job ID: $job_id");
            $this->sendSuccess(null, 'Job updated successfully');
        }
        $this->sendError('Failed to update job', 500);
    }

    private function deleteJob(): void {
        $job_id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
        if (!$job_id) $this->sendError('Job ID required', 400);
        if (!$this->job_model->belongsToCompany($job_id, $this->company_id)) $this->sendError('Unauthorized', 403);
        if ($this->job_model->delete($job_id, $this->company_id)) {
            $this->activity_model->log($this->company_id, 'job_deleted', "Deleted job ID: $job_id");
            $this->sendSuccess(null, 'Job deleted successfully');
        }
        $this->sendError('Failed to delete job', 500);
    }

    private function getApplications(): void {
        $status = $_GET['status'] ?? null;
        $page = isset($_GET['page']) ? (int) $_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int) $_GET['limit'] : 20;
        $offset = ($page - 1) * $limit;
        $applications = $this->application_model->getCompanyApplications($this->company_id, $status, $limit, $offset);
        $total = $this->application_model->countCompanyApplications($this->company_id, $status);
        $this->sendSuccess(compact('applications', 'total', 'page', 'limit'));
    }

    private function getJobApplications(): void {
        $job_id = isset($_GET['job_id']) ? (int) $_GET['job_id'] : 0;
        if (!$job_id) $this->sendError('Job ID required', 400);
        if (!$this->job_model->belongsToCompany($job_id, $this->company_id)) $this->sendError('Unauthorized', 403);
        $applications = $this->application_model->getJobApplications($job_id);
        $this->sendSuccess(['applications' => $applications]);
    }

    private function updateApplicationStatus(): void {
        $data = json_decode(file_get_contents("php://input"), true) ?? [];
        if (empty($data['application_id']) || empty($data['status'])) $this->sendError('Application ID and status required', 400);
        if (!$this->application_model->belongsToCompany((int) $data['application_id'], $this->company_id)) $this->sendError('Unauthorized', 403);
        if ($this->application_model->updateStatus((int) $data['application_id'], $data['status'], $data['notes'] ?? null)) {
            $this->activity_model->log($this->company_id, 'application_status_updated', "Updated application {$data['application_id']} to {$data['status']}");
            $this->sendSuccess(null, 'Application status updated');
        }
        $this->sendError('Failed to update status', 500);
    }

    private function getProfile(): void {
        $this->sendSuccess(['profile' => $this->company_model->getById($this->company_id)]);
    }

    private function updateProfile(): void {
        $data = json_decode(file_get_contents("php://input"), true) ?? [];
        if ($this->company_model->update($this->company_id, $data)) {
            $this->activity_model->log($this->company_id, 'profile_updated', 'Updated company profile');
            $this->sendSuccess(null, 'Profile updated successfully');
        }
        $this->sendError('Failed to update profile', 500);
    }

    private function uploadLogo(): void {
        if (!isset($_FILES['logo']) || $_FILES['logo']['error'] !== UPLOAD_ERR_OK) $this->sendError('No file uploaded or upload error', 400);
        $allowed_types = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!in_array($_FILES['logo']['type'], $allowed_types, true)) $this->sendError('Only JPEG and PNG images are allowed', 400);
        $upload_dir = __DIR__ . '/../../uploads/logos/';
        if (!file_exists($upload_dir)) mkdir($upload_dir, 0777, true);
        $extension = pathinfo($_FILES['logo']['name'], PATHINFO_EXTENSION);
        $filename = 'company_' . $this->company_id . '_' . time() . '.' . $extension;
        $filepath = $upload_dir . $filename;
        if (move_uploaded_file($_FILES['logo']['tmp_name'], $filepath)) {
            $logo_path = '/uploads/logos/' . $filename;
            $this->company_model->update($this->company_id, ['logo_path' => $logo_path]);
            $this->sendSuccess(['logo_path' => $logo_path], 'Logo uploaded successfully');
        }
        $this->sendError('Failed to upload file', 500);
    }

    private function sendMessage(): void {
        $data = json_decode(file_get_contents("php://input"), true) ?? [];
        $application_id = $data['application_id'] ?? 0;
        $message = $data['message'] ?? '';
        
        if (!$application_id) $this->sendError('Application ID required', 400);
        if (!$message) $this->sendError('Message required', 400);
        
        // Verify application belongs to this company
        if (!$this->application_model->belongsToCompany($application_id, $this->company_id)) {
            $this->sendError('Application not found', 404);
        }
        
        // Store message (for now, we'll just log it - in a real app, you'd have a messages table)
        $this->activity_model->log($this->user_id, 'message_sent', "Sent message to applicant for application ID: $application_id");
        
        $this->sendSuccess(null, 'Message sent successfully');
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

$api = new CompanyAPI();
$api->handleRequest();
