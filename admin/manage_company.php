<?php
include 'header.php';
include 'search_company.php';
?>
<div>
  <div class="panel-header">
    <h1>Company Detail</h1>
  </div>

  <div class="search-container">
    <h2>Search Company</h2>
    <form method="post" action="" class="tab-content">
      <input type="search" name="keyword" placeholder="Search by Company name, Company website..." required>
      <button type="submit" name="search" class="search-btn"><i class="fas fa-search"></i> Search</button>
    </form>
  </div>

  <table>
    <tr>
      <th>ID.</th>
      <th>Company Logo</th>
      <th>Company Name</th>
      <th>Email</th>
      <th>Location</th>
      <th>Website</th>
      <th>Contact Tel</th>
      <th>Operation</th>
    </tr>
    <?php
    $empty = 'No companies registered yet.';
    if (isset($_POST['search'])) {
      $keyword = $_POST['keyword'];
      $companies = search_company($conn, $keyword);
      if (empty($companies)) {
        $empty = "No companies found for the keyword: " . htmlspecialchars($keyword);
      }
    } else {
      $companies = fetch_companies($conn);
    }

    if (!empty($companies)) {
      foreach ($companies as $company) {
        // Safely get values with fallbacks
        $id = isset($company['id']) ? $company['id'] : (isset($company['company_id']) ? $company['company_id'] : '');
        $name = isset($company['name']) ? $company['name'] : (isset($company['company_name']) ? $company['company_name'] : '');
        $logo = isset($company['logo']) ? $company['logo'] : 'default_logo.png';
        $email = isset($company['email']) ? $company['email'] : '';
        $location = isset($company['location']) ? $company['location'] : '';
        $website = isset($company['website']) ? $company['website'] : '';
        $contact = isset($company['contact']) ? $company['contact'] : (isset($company['contact_tel']) ? $company['contact_tel'] : '');

        echo '
                   <tr>
                        <td>' . htmlspecialchars($id) . '</td>
                        <td><img src="../uploads/images/' . htmlspecialchars($logo) . '" alt="Company Logo" style="width: 50px; height: 50px; object-fit: cover;"></td>
                        <td>' . htmlspecialchars($name) . '</td>
                        <td>' . htmlspecialchars($email) . '</td>
                        <td>' . htmlspecialchars($location) . '</td>
                        <td>' . htmlspecialchars($website) . '</td>
                        <td>' . htmlspecialchars($contact) . '</td>
                        <td><a href="?company_id=' . $id . '&confirm=true" class="delete-btn" onclick="return confirm(\'Are you sure you want to delete this company?\')">Remove</a></td>
                    </tr>
                   ';
      }
    } else {
      echo "<tr><td colspan='8' style='text-align: center; padding: 20px;'>" . $empty . "</td></tr>";
    }
    ?>
  </table>

  <?php
  // DELETE FUNCTION
  function delete_company($conn, $company_id)
  {
    // First, get the logo filename to delete it from server
    // Try both possible column names
    $sql_logo = "SELECT logo FROM company WHERE id = ? OR company_id = ?";
    $stmt_logo = $conn->prepare($sql_logo);
    if (!$stmt_logo) return false;

    $stmt_logo->bind_param("ii", $company_id, $company_id);
    $stmt_logo->execute();
    $result_logo = $stmt_logo->get_result();

    if ($result_logo->num_rows > 0) {
      $company_data = $result_logo->fetch_assoc();
      $logo_file = $company_data['logo'];

      // Delete the logo file if it exists
      if ($logo_file && $logo_file != 'default_logo.png') {
        $logo_path = "../uploads/images/" . $logo_file;
        if (file_exists($logo_path)) {
          @unlink($logo_path);
        }
      }

      // Delete related jobs if jobs table exists
      $check_jobs = $conn->query("SHOW TABLES LIKE 'jobs'");
      if ($check_jobs && $check_jobs->num_rows > 0) {
        $sql_delete_jobs = "DELETE FROM jobs WHERE company_id = ?";
        $stmt_jobs = $conn->prepare($sql_delete_jobs);
        if ($stmt_jobs) {
          $stmt_jobs->bind_param("i", $company_id);
          $stmt_jobs->execute();
          $stmt_jobs->close();
        }
      }

      // Delete the company
      $sql_delete = "DELETE FROM company WHERE id = ? OR company_id = ?";
      $stmt = $conn->prepare($sql_delete);
      if (!$stmt) {
        $stmt_logo->close();
        return false;
      }

      $stmt->bind_param("ii", $company_id, $company_id);
      $result = $stmt->execute();

      $stmt_logo->close();
      $stmt->close();

      return $result;
    }

    $stmt_logo->close();
    return false;
  }

  // Handle deletion
  if (isset($_GET['company_id']) && isset($_GET['confirm']) && $_GET['confirm'] == 'true') {
    $company_id = intval($_GET['company_id']);
    if (delete_company($conn, $company_id)) {
      echo "<script>
                alert('Company deleted successfully!');
                window.location.href = 'manage_company.php';
            </script>";
      exit();
    } else {
      echo "<script>
                alert('Error deleting company!');
                window.location.href = 'manage_company.php';
            </script>";
      exit();
    }
  }
  ?>
</div>

<style>
  .search-container {
    margin: 20px 0;
    padding: 20px;
    background: #f5f5f5;
    border-radius: 8px;
  }

  .search-container form {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .search-container input[type="search"] {
    flex: 1;
    padding: 10px 15px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
  }

  .search-btn {
    padding: 10px 20px;
    background: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
  }

  .search-btn:hover {
    background: #45a049;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
  }

  table th {
    background: #2c3e50;
    color: white;
    padding: 15px;
    text-align: left;
  }

  table td {
    padding: 12px 15px;
    border-bottom: 1px solid #ddd;
  }

  table tr:hover {
    background: #f5f5f5;
  }

  .delete-btn {
    padding: 5px 15px;
    background: #f44336;
    color: white;
    text-decoration: none;
    border-radius: 4px;
    font-size: 14px;
  }

  .delete-btn:hover {
    background: #d32f2f;
  }
</style>

<?php include 'footer.php'; ?>