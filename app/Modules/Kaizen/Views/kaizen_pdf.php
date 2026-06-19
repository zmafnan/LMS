<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?= esc($title) ?></title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 20px;
      padding: 0;
    }
    .header {
      text-align: center;
      margin-bottom: 20px;
    }
    .section {
      margin-bottom: 15px;
    }
    .section-title {
      font-weight: bold;
      margin-bottom: 5px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
    th {
      background-color: #f2f2f2;
    }
    .photo-gallery {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 10px;
    }
    .photo-container {
      width: 200px;
    }
    .photo {
      width: 100%;
      height: auto;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1><?= esc($title) ?></h1>
    <p>Generated on: <?= esc($date) ?></p>
  </div>
  
  <div class="section">
    <div class="section-title">Submission Details</div>
    <table>
      <tr>
        <th>Ticket Number</th>
        <td><?= esc($submission['ticket_number']) ?></td>
      </tr>
      <tr>
        <th>PIC Name</th>
        <td><?= esc($submission['pic_name']) ?></td>
      </tr>
      <tr>
        <th>Department</th>
        <td><?= esc($submission['department']) ?></td>
      </tr>
      <tr>
        <th>Submission Date</th>
        <td><?= esc($submissionDateFormatted) ?></td>
      </tr>
      <tr>
        <th>Kaizen Type</th>
        <td><?= esc($submission['kaizen_type']) ?></td>
      </tr>
      <tr>
        <th>Status</th>
        <td><?= esc($submission['validation_status']) ?></td>
      </tr>
    </table>
  </div>
  
  <div class="section">
    <div class="section-title">Background</div>
    <p><?= nl2br(esc($submission['background'])) ?></p>
  </div>
  
  <div class="section">
    <div class="section-title">Before Implementation</div>
    <p><?= nl2br(esc($submission['before_description'])) ?></p>
    <?php if (!empty($photos_before)): ?>
      <div class="photo-gallery">
        <?php foreach ($photos_before as $photo): ?>
          <div class="photo-container">
            <img class="photo" src="<?= base_url($photo) ?>" alt="Before photo">
          </div>
        <?php endforeach; ?>
      </div>
    <?php endif; ?>
  </div>
  
  <div class="section">
    <div class="section-title">After Implementation</div>
    <p><?= nl2br(esc($submission['after_description'])) ?></p>
    <?php if (!empty($photos_after)): ?>
      <div class="photo-gallery">
        <?php foreach ($photos_after as $photo): ?>
          <div class="photo-container">
            <img class="photo" src="<?= base_url($photo) ?>" alt="After photo">
          </div>
        <?php endforeach; ?>
      </div>
    <?php endif; ?>
  </div>
  
  <div class="section">
    <div class="section-title">Benefits</div>
    <p><?= nl2br(esc($submission['benefits'])) ?></p>
  </div>
  
  <div class="section">
    <div class="section-title">Impact</div>
    <table>
      <tr>
        <th>Process Impact</th>
        <td><?= esc($submission['process_impact']) ?></td>
      </tr>
      <tr>
        <th>Quality Impact</th>
        <td><?= esc($submission['quality_impact']) ?></td>
      </tr>
      <tr>
        <th>PPH Impact</th>
        <td><?= esc($submission['pph_impact']) ?></td>
      </tr>
      <tr>
        <th>Cost Impact</th>
        <td><?= esc($submission['cost_impact']) ?></td>
      </tr>
    </table>
  </div>
  <script>
    window.onload = function() {
        setTimeout(function() {
            window.print();
        }, 500);
    };
  </script>
</body>
</html>
