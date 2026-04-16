CREATE DATABASE IF NOT EXISTS jobportal_db;
USE jobportal_db;

CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'company', 'candidate') NOT NULL,
    status ENUM('active', 'inactive', 'banned') DEFAULT 'active',
    email_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    reset_token VARCHAR(255),
    reset_expires DATETIME,
    last_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_status (status)
);

CREATE TABLE candidate_profiles (
    profile_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    location VARCHAR(255),
    skills TEXT,
    resume_path VARCHAR(500),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE companies (
    company_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    company_name VARCHAR(100) NOT NULL,
    logo_path VARCHAR(500),
    website VARCHAR(255),
    description TEXT,
    location VARCHAR(255),
    contact_email VARCHAR(100),
    verified_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE jobs (
    job_id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    location VARCHAR(255),
    job_type ENUM('full-time', 'part-time', 'contract', 'remote', 'hybrid') DEFAULT 'full-time',
    experience_level ENUM('entry', 'junior', 'mid', 'senior', 'lead') DEFAULT 'entry',
    salary_min DECIMAL(10,2),
    salary_max DECIMAL(10,2),
    posted_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    deadline DATE,
    status ENUM('open', 'closed', 'expired') DEFAULT 'open',
    views_count INT DEFAULT 0,
    applications_count INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (company_id) REFERENCES companies(company_id) ON DELETE CASCADE,
    FULLTEXT INDEX idx_search (title, description, requirements)
);

CREATE TABLE job_applications (
    application_id INT PRIMARY KEY AUTO_INCREMENT,
    job_id INT NOT NULL,
    candidate_id INT NOT NULL,
    company_id INT NOT NULL,
    cover_letter TEXT,
    resume_used VARCHAR(500),
    status ENUM('pending', 'reviewed', 'shortlisted', 'rejected', 'hired', 'withdrawn') DEFAULT 'pending',
    applied_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(job_id) ON DELETE CASCADE,
    FOREIGN KEY (candidate_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES companies(company_id) ON DELETE CASCADE,
    UNIQUE KEY unique_application (job_id, candidate_id)
);

INSERT INTO users (email, password_hash, role, status, email_verified)
VALUES
('admin@jobportal.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'active', TRUE),
('company@techcorp.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'company', 'active', TRUE),
('candidate@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'candidate', 'active', TRUE);
