<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../models/User.php';
require_once __DIR__ . '/../../models/Company.php';
require_once __DIR__ . '/../../models/Job.php';
require_once __DIR__ . '/../../models/Application.php';
require_once __DIR__ . '/../../models/ActivityLog.php';

class AdminAPI {
    private User $user_model;
    private Company $company_model;
    private Job $job_model;
    private Application $application_model;
    private ActivityLog $activity_model;
    private int $admin_id;

    public function __construct() {
        $this->user_model = new User();
        $this->company_model = new Company();
        $this->job_model = new Job();
        $this->application_model = new Application();
        $this->activity_model = new ActivityLog();

        $user = AuthMiddleware::validateToken();
        if ($user['role'] !== 'admin') {
            $this->sendError('Access denied. Admin role required.', 403);
        }
        $this->admin_id = (int) $user['user_id'];
    }

    public function handleRequest(): void {
        $method = $_SERVER['REQUEST_METHOD'];
        $action = $_GET['action'] ?? '';

        switch ($method) {
            case 'GET':
                if ($action === 'dashboard') $this->getDashboard();
                elseif ($action === 'users') $this->getUsers();
                elseif ($action === 'companies') $this->getCompanies();
                elseif ($action === 'jobs') $this->getJobs();
                elseif ($action === 'pending_jobs') $this->getPendingJobs();
                elseif ($action === 'analytics') $this->getAnalytics();
                elseif ($action === 'activity_logs') $this->getActivityLogs();
                else $this->sendError('Invalid action', 400);
                break;
            case 'PUT':
                if ($action === 'verify_company') $this->verifyCompany();
                elseif ($action === 'update_user_status') $this->updateUserStatus();
                elseif ($action === 'approve_job') $this->approveJob();
                elseif ($action === 'reject_job') $this->rejectJob();
                else $this->sendError('Invalid action', 400);
                break;
            case 'DELETE':
                if ($action === 'delete_user') $this->deleteUser();
                elseif ($action === 'delete_job') $this->deleteJob();
                else $this->sendError('Invalid action', 400);
                break;
            case 'POST':
                if ($action === 'upload_profile_image') $this->uploadProfileImage();
                else $this->sendError('Invalid action', 400);
                break;
            default:
                $this->sendError('Method not allowed', 405);
        }
    }

    private function getDashboard(): void {
        $stats = [
            'total_users' => $this->user_model->countAll(),
            'total_companies' => $this->company_model->countAll(),
            'total_candidates' => $this->user_model->countByRole('candidate'),
            'total_jobs' => $this->job_model->countAll(),
            'active_jobs' => $this->job_model->countActive(),
            'pending_jobs' => $this->job_model->countPending(),
            'total_applications' => $this->application_model->countAll(),
            'pending_companies' => $this->company_model->countPending(),
            'recent_users' => $this->user_model->getRecent(10),
            'recent_jobs' => $this->job_model->getRecent(10),
            'recent_applications' => $this->application_model->getRecent(10),
        ];
        $this->sendSuccess($stats);
    }

    private function getUsers(): void {
        $page = isset($_GET['page']) ? (int) $_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int) $_GET['limit'] : 20;
        $offset = ($page - 1) * $limit;
        $role = $_GET['role'] ?? null;
        $status = $_GET['status'] ?? null;
        $users = $this->user_model->getAll($limit, $offset, $role, $status);
        $total = $this->user_model->countAll($role, $status);
        $this->sendSuccess(compact('users', 'total', 'page', 'limit'));
    }

    private function getCompanies(): void {
        $status = $_GET['status'] ?? null;
        $page = isset($_GET['page']) ? (int) $_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int) $_GET['limit'] : 20;
        $offset = ($page - 1) * $limit;
        $companies = $this->company_model->getAll($limit, $offset, $status);
        $total = $this->company_model->countAll($status);
        $this->sendSuccess(compact('companies', 'total', 'page', 'limit'));
    }

    private function verifyCompany(): void {
        $data = json_decode(file_get_contents("php://input"), true) ?? [];
        if (empty($data['company_id']) || empty($data['status'])) $this->sendError('Company ID and status required', 400);
        if ($this->company_model->updateVerificationStatus((int) $data['company_id'], $data['status'])) {
            $this->activity_model->log(null, 'company_verified', "Company {$data['company_id']} status changed to {$data['status']}");
            $this->sendSuccess(null, 'Company verification status updated');
        }
        $this->sendError('Failed to update company status', 500);
    }

    private function updateUserStatus(): void {
        $data = json_decode(file_get_contents("php://input"), true) ?? [];
        if (empty($data['user_id']) || empty($data['status'])) $this->sendError('User ID and status required', 400);
        if ($this->user_model->updateStatus((int) $data['user_id'], $data['status'])) {
            $this->activity_model->log(null, 'user_status_updated', "User {$data['user_id']} status changed to {$data['status']}");
            $this->sendSuccess(null, 'User status updated');
        }
        $this->sendError('Failed to update user status', 500);
    }

    private function deleteUser(): void {
        $user_id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
        if (!$user_id) $this->sendError('User ID required', 400);
        if ($this->user_model->delete($user_id)) {
            $this->activity_model->log(null, 'user_deleted', "Deleted user ID: $user_id");
            $this->sendSuccess(null, 'User deleted successfully');
        }
        $this->sendError('Failed to delete user', 500);
    }

    private function getJobs(): void {
        $status = $_GET['status'] ?? null;
        $approvalStatus = $_GET['approval_status'] ?? null;
        $page = isset($_GET['page']) ? (int) $_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int) $_GET['limit'] : 20;
        $offset = ($page - 1) * $limit;
        $jobs = $this->job_model->getAllJobs($limit, $offset, $status, $approvalStatus);
        $total = $this->job_model->countAll($status);
        $this->sendSuccess(compact('jobs', 'total', 'page', 'limit'));
    }

    private function getPendingJobs(): void {
        $page = isset($_GET['page']) ? (int) $_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int) $_GET['limit'] : 20;
        $offset = ($page - 1) * $limit;
        $jobs = $this->job_model->getPendingJobs($limit, $offset);
        $total = $this->job_model->countPending();
        $this->sendSuccess(compact('jobs', 'total', 'page', 'limit'));
    }

    private function approveJob(): void {
        $data = json_decode(file_get_contents("php://input"), true) ?? [];
        if (empty($data['job_id'])) $this->sendError('Job ID required', 400);
        
        // Get admin user ID from token
        $user = AuthMiddleware::validateToken();
        $adminId = (int) $user['user_id'];
        
        if ($this->job_model->approveJob((int) $data['job_id'], $adminId)) {
            $this->activity_model->log(null, 'job_approved', "Approved job ID: {$data['job_id']}");
            $this->sendSuccess(null, 'Job approved successfully');
        }
        $this->sendError('Failed to approve job', 500);
    }

    private function rejectJob(): void {
        $data = json_decode(file_get_contents("php://input"), true) ?? [];
        if (empty($data['job_id'])) $this->sendError('Job ID required', 400);
        $reason = $data['reason'] ?? 'No reason provided';
        
        // Get admin user ID from token
        $user = AuthMiddleware::validateToken();
        $adminId = (int) $user['user_id'];
        
        if ($this->job_model->rejectJob((int) $data['job_id'], $adminId, $reason)) {
            $this->activity_model->log(null, 'job_rejected', "Rejected job ID: {$data['job_id']}. Reason: $reason");
            $this->sendSuccess(null, 'Job rejected successfully');
        }
        $this->sendError('Failed to reject job', 500);
    }

    private function deleteJob(): void {
        $job_id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
        if (!$job_id) $this->sendError('Job ID required', 400);
        if ($this->job_model->delete($job_id)) {
            $this->activity_model->log(null, 'job_deleted_admin', "Admin deleted job ID: $job_id");
            $this->sendSuccess(null, 'Job deleted successfully');
        }
        $this->sendError('Failed to delete job', 500);
    }

    private function getAnalytics(): void {
        $period = $_GET['period'] ?? 'month';
        $analytics = [
            'jobs_by_type' => $this->job_model->getJobsByType(),
            'jobs_by_location' => $this->job_model->getJobsByLocation(),
            'applications_by_status' => $this->application_model->getApplicationsByStatus(),
            'registrations_by_period' => $this->user_model->getRegistrationsByPeriod($period),
            'top_companies' => $this->company_model->getTopCompanies(10),
            'top_jobs' => $this->job_model->getTopJobs(10),
        ];
        $this->sendSuccess($analytics);
    }

    private function getActivityLogs(): void {
        $page = isset($_GET['page']) ? (int) $_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int) $_GET['limit'] : 50;
        $offset = ($page - 1) * $limit;
        $action = $_GET['action'] ?? null;
        $logs = $this->activity_model->getAll($limit, $offset, $action);
        $total = $this->activity_model->countAll($action);
        $this->sendSuccess(compact('logs', 'total', 'page', 'limit'));
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
        $filename = 'admin_' . $this->admin_id . '_' . time() . '.' . $extension;
        $filepath = $upload_dir . $filename;
        if (move_uploaded_file($_FILES['profile_image']['tmp_name'], $filepath)) {
            $profile_image = '/uploads/profile_images/' . $filename;
            $this->user_model->updateProfileImage($this->admin_id, $profile_image);
            $this->sendSuccess(['profile_image' => $profile_image], 'Profile image uploaded successfully');
        }
        $this->sendError('Failed to upload file', 500);
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

$api = new AdminAPI();
$api->handleRequest();
