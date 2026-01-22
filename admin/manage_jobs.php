<?php
include 'header.php';
?>

<div id="jobs">
  <div class="panel-header">
    <h1>Job Details</h1>
    <a href="add_job.php" class="add-job-btn"><i class="fas fa-plus"></i> Add New Job</a>
  </div>

  <?php
  // Function to fetch all jobs - SIMPLIFIED VERSION
  function get_all_jobs($conn)
  {
    $jobs = array();

    // Check if jobs table exists
    $check_jobs = $conn->query("SHOW TABLES LIKE 'jobs'");
    if ($check_jobs->num_rows == 0) {
      return $jobs; // jobs table doesn't exist
    }

    // Simple query - just get jobs data
    $sql = "SELECT * FROM jobs ORDER BY id DESC";
    $result = $conn->query($sql);

    if ($result && $result->num_rows > 0) {
      while ($row = $result->fetch_assoc()) {
        // Get company information separately if needed
        if (!empty($row['company_id'])) {
          $company_id = $row['company_id'];
          $company_result = $conn->query("SELECT * FROM company WHERE company_id = $company_id LIMIT 1");
          if ($company_result && $company_result->num_rows > 0) {
            $company = $company_result->fetch_assoc();
            // Add all company data to job array
            foreach ($company as $key => $value) {
              $row['company_' . $key] = $value;
            }
          }
        }
        $jobs[] = $row;
      }
    }
    return $jobs;
  }

  // Function to delete job
  function delete_job($conn, $job_id)
  {
    // Check if jobs table exists
    $check_table = $conn->query("SHOW TABLES LIKE 'jobs'");
    if ($check_table->num_rows == 0) {
      return false;
    }

    $sql = "DELETE FROM jobs WHERE id = ?";
    $stmt = $conn->prepare($sql);
    if (!$stmt) return false;

    $stmt->bind_param("i", $job_id);
    $result = $stmt->execute();
    $stmt->close();

    return $result;
  }

  // Handle job deletion
  if (isset($_GET['job_id']) && isset($_GET['confirm']) && $_GET['confirm'] == 'true') {
    $job_id = intval($_GET['job_id']);

    if (delete_job($conn, $job_id)) {
      echo "<script>
                alert('Job deleted successfully!');
                window.location.href = 'manage_jobs.php';
            </script>";
      exit();
    } else {
      echo "<script>
                alert('Error deleting job!');
                window.location.href = 'manage_jobs.php';
            </script>";
      exit();
    }
  }
  ?>

  <?php
  // DEBUG: Show what data we have
  $jobs = get_all_jobs($conn);
  if (!empty($jobs)) {
    echo "<!-- Debug: First job data -->";
    echo "<!-- ";
    print_r($jobs[0]);
    echo " -->";
  }
  ?>

  <table>
    <tr>
      <th>ID.</th>
      <th>Job Title</th>
      <th>Company</th>
      <th>Industry/Skill</th>
      <th>Location</th>
      <th>Job Type</th>
      <th>Salary</th>
      <th>Posted Date</th>
      <th>Deadline</th>
      <th>Operation</th>
    </tr>
    <?php
    if (!empty($jobs)) {
      foreach ($jobs as $job) {
        // Format dates if needed
        $posted_date = !empty($job['created_at']) ? date('M d, Y', strtotime($job['created_at'])) : 'N/A';
        $deadline = !empty($job['deadline']) && $job['deadline'] != '0000-00-00' ? date('M d, Y', strtotime($job['deadline'])) : 'N/A';

        // Get company name from various possible columns
        $company_name = 'Unknown Company';
        if (isset($job['company_name'])) {
          $company_name = $job['company_name'];
        } elseif (isset($job['company_company_name'])) {
          $company_name = $job['company_company_name'];
        } elseif (isset($job['company_companyname'])) {
          $company_name = $job['company_companyname'];
        } elseif (isset($job['company_name'])) {
          $company_name = $job['company_name'];
        } elseif (isset($job['company_id'])) {
          $company_name = 'Company #' . $job['company_id'];
        }

        echo '
                <tr>
                    <td>' . htmlspecialchars($job['id']) . '</td>
                    <td>' . htmlspecialchars($job['title'] ?? 'N/A') . '</td>
                    <td>' . htmlspecialchars($company_name) . '</td>
                    <td>' . htmlspecialchars($job['skill'] ?? 'N/A') . '</td>
                    <td>' . htmlspecialchars($job['location'] ?? 'N/A') . '</td>
                    <td>' . htmlspecialchars($job['type'] ?? 'N/A') . '</td>
                    <td>' . htmlspecialchars($job['salary'] ?? 'N/A') . '</td>
                    <td>' . $posted_date . '</td>
                    <td>' . $deadline . '</td>
                    <td>
                        <a href="?job_id=' . $job['id'] . '&confirm=true" 
                           class="delete-btn" 
                           onclick="return confirm(\'Are you sure you want to delete \\\'' . htmlspecialchars(addslashes($job['title'] ?? '')) . '\\\' job?\')">
                           <i class="fas fa-trash"></i> Delete
                        </a>
                    </td>
                </tr>';
      }
    } else {
      echo "<tr><td colspan='10' style='text-align: center; padding: 20px;'>No jobs found in the database.</td></tr>";
    }
    ?>
  </table>
</div>

<style>
  #jobs {
    padding: 20px;
    min-height: 100vh;
    background: #f5f7fa;
  }

  .panel-header {
    background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
    color: white;
    padding: 20px 25px;
    border-radius: 10px 10px 0 0;
    margin-bottom: 25px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .panel-header h1 {
    margin: 0;
    font-size: 26px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .panel-header h1:before {
    content: "📋";
    font-size: 28px;
  }

  .add-job-btn {
    padding: 10px 20px;
    background: #27ae60;
    color: white;
    text-decoration: none;
    border-radius: 6px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;
  }

  .add-job-btn:hover {
    background: #219653;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(39, 174, 96, 0.3);
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
    background: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border-radius: 10px;
    overflow: hidden;
    border: 1px solid #e1e5eb;
  }

  table th {
    background: #34495e;
    color: white;
    padding: 18px 15px;
    text-align: left;
    font-weight: 600;
    border: none;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  table th:first-child {
    border-radius: 10px 0 0 0;
  }

  table th:last-child {
    border-radius: 0 10px 0 0;
  }

  table td {
    padding: 16px 15px;
    border-bottom: 1px solid #f0f0f0;
    color: #333;
    font-size: 14px;
  }

  table tr:hover {
    background: #f8fafc;
    transition: background 0.3s ease;
  }

  table tr:last-child td {
    border-bottom: none;
  }

  .delete-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 8px 18px;
    background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
    color: white;
    text-decoration: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.3s ease;
    border: none;
    cursor: pointer;
    min-width: 100px;
    box-shadow: 0 3px 6px rgba(231, 76, 60, 0.2);
  }

  .delete-btn:hover {
    background: linear-gradient(135deg, #c0392b 0%, #a93226 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(231, 76, 60, 0.3);
  }

  .delete-btn:active {
    transform: translateY(0);
  }

  .delete-btn i {
    font-size: 14px;
  }

  /* Make the table responsive */
  @media (max-width: 1200px) {
    #jobs {
      padding: 15px;
    }

    table {
      display: block;
      overflow-x: auto;
      white-space: nowrap;
    }

    .panel-header {
      padding: 15px 20px;
      flex-direction: column;
      gap: 15px;
      align-items: flex-start;
    }

    .panel-header h1 {
      font-size: 22px;
    }
  }

  @media (max-width: 768px) {
    .delete-btn {
      padding: 6px 12px;
      font-size: 13px;
      min-width: auto;
    }

    table th,
    table td {
      padding: 12px 10px;
      font-size: 13px;
    }
  }
</style>

<?php include 'footer.php'; ?>