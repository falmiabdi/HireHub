<?php include 'header.php'; ?>
<div id="jobs">
     <div class="panel-header">
         <h1>Job Details</h1>
     </div>

     <table>
         <tr>
             <th>ID.</th>
             <th>Job Title</th>
             <th>Posted Company</th>
             <th>Industry</th>
             <th>Place</th>
             <th>Job Type</th>
             <th>Salary</th>
             <th>Posted Date</th>
             <th>Deadline</th>
             <th>Operation</th>
         </tr>
         <?php
            $jobs = fetch_jobs($conn);
            if (!empty($jobs)) {
                foreach ($jobs as $job) {
                    echo '
                    <tr>
                            <td>' . $job['id'] . '</td>
                            <td>' . $job['title'] . '</td>
                            <td>' . $job['name'] . '</td>
                            <td>' . $job['skill'] . '</td>
                            <td>' . $job['location'] . '</td>
                            <td>' . $job['type'] . '</td>
                            <td>' . $job['salary'] . '</td>
                            <td>' . $job['created_at'] . '</td>
                            <td>' . $job['deadline'] . '</td>
                            <td><a href="?job_id=' . $job['id'] . '&confirm=true" data-translate="delete-job" class="view-applicants" onclick="return confirm(\'Are you sure you want to delete this job?\')">Remove</a></td>
                          </tr>';
                }
            } else {
                echo "<tr><td colspan='10'>No jobs found.</td></tr>";
            }
            ?>

     </table>
     <?php
     if(isset($_GET['job_id']) && isset($_GET['confirm']) && $_GET['confirm'] == 'true'){
        delete_job($conn,$job['id'],$admin_id);
        header("Location: " . str_replace("&confirm=true", "", $_SERVER['REQUEST_URI']));
        exit();
    }
     ?>
 </div>
<?php include 'footer.php'; ?>