<?php

require_once __DIR__ . "/../../config/cors.php";
require_once __DIR__ . "/../../helpers/Response.php";
require_once __DIR__ . "/../../models/Job.php";
require_once __DIR__ . "/../../models/Company.php";

class PublicAPI {
    private Job $jobModel;
    private Company $companyModel;

    public function __construct() {
        $this->jobModel = new Job();
        $this->companyModel = new Company();
    }

    public function handleRequest(): void {
        if ($_SERVER["REQUEST_METHOD"] !== "GET") {
            Response::error("Method not allowed", 405);
        }

        $endpoint = $_GET["endpoint"] ?? "";
        switch ($endpoint) {
            case "jobs":
                $this->getJobs();
                break;
            case "job":
                $this->getJobDetail();
                break;
            case "companies":
                $this->getCompanies();
                break;
            case "search":
                $this->searchJobs();
                break;
            default:
                Response::error("Invalid endpoint", 400);
        }
    }

    private function getJobs(): void {
        $page = isset($_GET["page"]) ? (int) $_GET["page"] : 1;
        $limit = isset($_GET["limit"]) ? (int) $_GET["limit"] : 20;
        $offset = ($page - 1) * $limit;

        $filters = [
            "search" => $_GET["search"] ?? "",
            "location" => $_GET["location"] ?? "",
        ];

        $jobs = $this->jobModel->getPublicJobs($limit, $offset, $filters);
        Response::success(["jobs" => $jobs, "page" => $page, "limit" => $limit]);
    }

    private function getJobDetail(): void {
        $jobId = isset($_GET["id"]) ? (int) $_GET["id"] : 0;
        if (!$jobId) {
            Response::error("Job ID required", 400);
        }
        $job = $this->jobModel->getJobById($jobId);
        if (!$job) {
            Response::error("Job not found", 404);
        }
        Response::success(["job" => $job]);
    }

    private function getCompanies(): void {
        $companies = $this->companyModel->getVerifiedCompanies();
        Response::success(["companies" => $companies]);
    }

    private function searchJobs(): void {
        $keyword = $_GET["keyword"] ?? "";
        $location = $_GET["location"] ?? "";
        $results = $this->jobModel->searchJobs($keyword, $location);
        Response::success(["results" => $results]);
    }
}

$api = new PublicAPI();
$api->handleRequest();
