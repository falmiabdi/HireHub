<?php
include 'header.php';
include 'search_candidate.php';
?>

<div id="candidates">
  <div class="panel-header">
    <h1>Candidates Detail</h1>
  </div>

  <?php
  // Function to delete candidate with proper foreign key handling
  function delete_candidate($conn, $candidate_id)
  {
    // Start transaction for data consistency
    $conn->begin_transaction();

    try {
      // 1. Get the candidate's profile picture first
      $profile_pic = null;
      $profile_sql = "SELECT profile_picture FROM candidates WHERE id = ?";
      $profile_stmt = $conn->prepare($profile_sql);
      if ($profile_stmt) {
        $profile_stmt->bind_param("i", $candidate_id);
        $profile_stmt->execute();
        $profile_result = $profile_stmt->get_result();
        if ($profile_row = $profile_result->fetch_assoc()) {
          $profile_pic = $profile_row['profile_picture'];
        }
        $profile_stmt->close();
      }

      // Delete the profile picture file
      if ($profile_pic && $profile_pic != 'default_profile.png') {
        $profile_path = "../uploads/images/" . $profile_pic;
        if (file_exists($profile_path)) {
          @unlink($profile_path);
        }
      }

      // 2. Delete from activity_logs (check if user exists first)
      $check_logs = $conn->query("SHOW TABLES LIKE 'activity_logs'");
      if ($check_logs && $check_logs->num_rows > 0) {
        // Try to find if there's a user with this ID in activity_logs
        $log_sql = "DELETE FROM activity_logs WHERE user_id = ?";
        $log_stmt = $conn->prepare($log_sql);
        if ($log_stmt) {
          $log_stmt->bind_param("i", $candidate_id);
          $log_stmt->execute();
          $log_stmt->close();
        }
      }

      // 3. Delete from applicants table
      $check_applicants = $conn->query("SHOW TABLES LIKE 'applicants'");
      if ($check_applicants && $check_applicants->num_rows > 0) {
        $applicant_sql = "DELETE FROM applicants WHERE candidate_id = ?";
        $applicant_stmt = $conn->prepare($applicant_sql);
        if ($applicant_stmt) {
          $applicant_stmt->bind_param("i", $candidate_id);
          $applicant_stmt->execute();
          $applicant_stmt->close();
        }
      }

      // 4. Finally, delete the candidate
      $candidate_sql = "DELETE FROM candidates WHERE id = ?";
      $candidate_stmt = $conn->prepare($candidate_sql);
      if (!$candidate_stmt) {
        throw new Exception("Failed to prepare candidate delete statement");
      }

      $candidate_stmt->bind_param("i", $candidate_id);
      $candidate_result = $candidate_stmt->execute();
      $candidate_stmt->close();

      if (!$candidate_result) {
        throw new Exception("Failed to delete candidate");
      }

      // Commit the transaction
      $conn->commit();
      return true;
    } catch (Exception $e) {
      // Rollback on error
      $conn->rollback();
      error_log("Delete candidate error: " . $e->getMessage());
      return false;
    }
  }

  // Handle candidate deletion
  if (isset($_GET['candidate_id']) && isset($_GET['confirm']) && $_GET['confirm'] == 'true') {
    $candidate_id = intval($_GET['candidate_id']);

    if (delete_candidate($conn, $candidate_id)) {
      echo "<script>
                alert('Candidate deleted successfully!');
                window.location.href = 'manage_candidate.php';
            </script>";
      exit();
    } else {
      echo "<script>
                alert('Error deleting candidate! Please try again.');
                window.location.href = 'manage_candidate.php';
            </script>";
      exit();
    }
  }
  ?>

  <div class="search-container">
    <h2>Search Candidate</h2>
    <form method="post" action="">
      <input type="search" name="keyword" placeholder="Search by phone, country, field..."
        value="<?php echo isset($_POST['keyword']) ? htmlspecialchars($_POST['keyword']) : ''; ?>" required>
      <button type="submit" name="search" class="search-btn"><i class="fas fa-search"></i> Search</button>
      <a href="manage_candidate.php" class="clear-btn"><i class="fas fa-times"></i> Clear</a>
    </form>
  </div>

  <?php
  // Simple function to get candidates - NO JOIN with users table
  function get_candidates_basic($conn)
  {
    $candidates = array();

    // Just get candidates data - no join with users table
    $sql = "SELECT * FROM candidates ORDER BY id DESC";
    $result = $conn->query($sql);

    if ($result && $result->num_rows > 0) {
      while ($row = $result->fetch_assoc()) {
        // Check if candidates have name/email in their own table
        // Based on your table structure, candidates might not have name/email
        // These might be in a separate table or not stored at all
        $candidates[] = $row;
      }
    }

    return $candidates;
  }

  // Get candidates data
  $empty = 'No candidates registered yet.';
  if (isset($_POST['search'])) {
    $keyword = $_POST['keyword'];
    $candidates = search_candidate($conn, $keyword);
    if (empty($candidates)) {
      $empty = "No candidates found for: " . htmlspecialchars($keyword);
    }
  } else {
    $candidates = get_candidates_basic($conn);
  }

  // Count total candidates
  $total_candidates = count($candidates);
  ?>

  <?php if ($total_candidates > 0): ?>
    <div class="summary-info">
      <div class="summary-item">
        <i class="fas fa-users"></i>
        <span>Total Candidates: <strong><?php echo $total_candidates; ?></strong></span>
      </div>
      <div class="summary-item">
        <i class="fas fa-info-circle"></i>
        <span>Click delete button to remove a candidate</span>
      </div>
    </div>
  <?php endif; ?>

  <div class="table-container">
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Profile</th>
          <th>Phone</th>
          <th>Country</th>
          <th>Address</th>
          <th>Field</th>
          <th>Experience</th>
          <th>Gender</th>
          <th>Education</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <?php
        if (!empty($candidates)) {
          foreach ($candidates as $candidate) {
            $candidate_id = $candidate['id'] ?? '';
            $profile_pic = $candidate['profile_picture'] ?? 'default_profile.png';

            // Get data from candidates table (as shown in your screenshot)
            $phone = $candidate['phone'] ?? '';
            $country = $candidate['country'] ?? '';
            $address = $candidate['address'] ?? '';
            $field = $candidate['field'] ?? '';
            $experience = $candidate['experience'] ?? '';
            $gender = $candidate['gender'] ?? '';
            $education = $candidate['education'] ?? '';
            $summary = $candidate['summary'] ?? '';

            echo '<tr>
                            <td>#' . htmlspecialchars($candidate_id) . '</td>
                            <td>
                                <div class="profile-img">
                                    <img src="../uploads/images/' . htmlspecialchars($profile_pic) . '" 
                                         alt="Candidate"
                                         onerror="this.src=\'../uploads/images/default_profile.png\'">
                                </div>
                            </td>
                            <td class="candidate-phone">' . htmlspecialchars($phone) . '</td>
                            <td>' . htmlspecialchars($country) . '</td>
                            <td>' . htmlspecialchars($address) . '</td>
                            <td><span class="field-badge">' . htmlspecialchars($field) . '</span></td>
                            <td><span class="experience-badge">' . htmlspecialchars($experience) . '</span></td>
                            <td><span class="gender-label ' . strtolower($gender) . '">' . htmlspecialchars($gender) . '</span></td>
                            <td><span class="education-label">' . htmlspecialchars($education) . '</span></td>
                            <td>
                                <div class="action-buttons">
                                    <a href="view_candidate.php?id=' . $candidate_id . '" class="view-btn" title="View">
                                        <i class="fas fa-eye"></i>
                                    </a>
                                    <a href="edit_candidate.php?id=' . $candidate_id . '" class="edit-btn" title="Edit">
                                        <i class="fas fa-edit"></i>
                                    </a>
                                    <a href="?candidate_id=' . $candidate_id . '&confirm=true" 
                                       class="delete-btn" 
                                       onclick="return confirm(\'⚠️ DELETE CANDIDATE\\n\\nID: #' . $candidate_id . '\\nPhone: ' . htmlspecialchars($phone) . '\\n\\nThis will permanently delete:\\n• Candidate profile\\n• Activity logs\\n• Job applications\\n• Profile picture\\n\\nThis action cannot be undone!\')"
                                       title="Delete">
                                        <i class="fas fa-trash"></i>
                                    </a>
                                </div>
                            </td>
                        </tr>';
          }
        } else {
          echo '<tr><td colspan="10" class="no-data">
                            <div class="empty-state">
                                <i class="fas fa-user-friends"></i>
                                <h3>No Candidates Found</h3>
                                <p>' . $empty . '</p>
                                <a href="add_candidate.php" class="add-candidate-btn">
                                    <i class="fas fa-plus"></i> Add New Candidate
                                </a>
                            </div>
                        </td></tr>';
        }
        ?>
      </tbody>
    </table>
  </div>
</div>

<style>
  #candidates {
    padding: 20px;
    background: #f5f7fa;
    min-height: 100vh;
  }

  .panel-header {
    background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
    color: white;
    padding: 20px 25px;
    border-radius: 10px;
    margin-bottom: 25px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .panel-header h1 {
    margin: 0;
    font-size: 28px;
    font-weight: 600;
  }

  .summary-info {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }

  .summary-item {
    background: white;
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    color: #495057;
  }

  .summary-item i {
    color: #3498db;
    font-size: 18px;
  }

  .summary-item strong {
    color: #2c3e50;
    font-size: 18px;
  }

  .search-container {
    background: white;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 25px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .search-container h2 {
    margin-top: 0;
    color: #2c3e50;
    margin-bottom: 20px;
    font-size: 22px;
  }

  .search-container form {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .search-container input[type="search"] {
    flex: 1;
    padding: 12px 15px;
    border: 2px solid #e1e5eb;
    border-radius: 8px;
    font-size: 16px;
    transition: all 0.3s;
    background: #f8f9fa;
  }

  .search-container input[type="search"]:focus {
    border-color: #3498db;
    outline: none;
    background: white;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
  }

  .search-btn,
  .clear-btn {
    padding: 12px 25px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
    font-weight: 500;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.3s;
  }

  .search-btn {
    background: #28a745;
    color: white;
  }

  .search-btn:hover {
    background: #218838;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(40, 167, 69, 0.3);
  }

  .clear-btn {
    background: #6c757d;
    color: white;
  }

  .clear-btn:hover {
    background: #5a6268;
    transform: translateY(-2px);
  }

  .table-container {
    background: white;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  table th {
    background: #2c3e50;
    color: white;
    padding: 18px 15px;
    text-align: left;
    font-weight: 600;
    border: none;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  table td {
    padding: 16px 15px;
    border-bottom: 1px solid #f0f0f0;
    color: #333;
    font-size: 14px;
    vertical-align: middle;
  }

  table tbody tr:hover {
    background: #f8fafc;
  }

  .no-data {
    text-align: center;
  }

  .empty-state {
    padding: 50px 20px;
    text-align: center;
  }

  .empty-state i {
    font-size: 60px;
    color: #bdc3c7;
    margin-bottom: 20px;
  }

  .empty-state h3 {
    color: #2c3e50;
    margin-bottom: 10px;
    font-size: 22px;
  }

  .empty-state p {
    color: #7f8c8d;
    margin-bottom: 25px;
    font-size: 16px;
  }

  .add-candidate-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 25px;
    background: #3498db;
    color: white;
    text-decoration: none;
    border-radius: 6px;
    font-weight: 500;
    transition: all 0.3s;
  }

  .add-candidate-btn:hover {
    background: #2980b9;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(52, 152, 219, 0.3);
  }

  .profile-img {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid #e1e5eb;
    background: #f8f9fa;
  }

  .profile-img img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .candidate-phone {
    font-weight: 600;
    color: #2c3e50;
    font-family: monospace;
  }

  .field-badge {
    display: inline-block;
    padding: 4px 10px;
    background: #e8f4fc;
    color: #2980b9;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
  }

  .experience-badge {
    display: inline-block;
    padding: 4px 10px;
    background: #fff3cd;
    color: #856404;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
  }

  .gender-label {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
  }

  .gender-label.male {
    background: #d6eaf8;
    color: #2c81ba;
  }

  .gender-label.female {
    background: #fadbd8;
    color: #c0392b;
  }

  .education-label {
    display: inline-block;
    padding: 4px 10px;
    background: #e8f6f3;
    color: #16a085;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
  }

  .action-buttons {
    display: flex;
    gap: 8px;
  }

  .view-btn,
  .edit-btn,
  .delete-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 6px;
    color: white;
    text-decoration: none;
    transition: all 0.3s;
    border: none;
    cursor: pointer;
    font-size: 14px;
  }

  .view-btn {
    background: #3498db;
  }

  .view-btn:hover {
    background: #2980b9;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(52, 152, 219, 0.3);
  }

  .edit-btn {
    background: #f39c12;
  }

  .edit-btn:hover {
    background: #e67e22;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(243, 156, 18, 0.3);
  }

  .delete-btn {
    background: #e74c3c;
  }

  .delete-btn:hover {
    background: #c0392b;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(231, 76, 60, 0.3);
  }

  /* Responsive */
  @media (max-width: 1200px) {
    .table-container {
      overflow-x: auto;
    }

    table {
      min-width: 1000px;
    }
  }

  @media (max-width: 768px) {
    #candidates {
      padding: 15px;
    }

    .panel-header {
      padding: 15px 20px;
    }

    .panel-header h1 {
      font-size: 24px;
    }

    .summary-info {
      flex-direction: column;
      gap: 10px;
    }

    .search-container {
      padding: 15px;
    }

    .search-container form {
      flex-direction: column;
      align-items: stretch;
    }

    .search-container input[type="search"] {
      width: 100%;
    }

    .search-btn,
    .clear-btn {
      width: 100%;
    }
  }
</style>

<script>
  document.addEventListener('DOMContentLoaded', function() {
    // Handle image errors
    document.querySelectorAll('.profile-img img').forEach(img => {
      img.onerror = function() {
        this.src = '../uploads/images/default_profile.png';
      };
    });
  });
</script>

<?php include 'footer.php'; ?>