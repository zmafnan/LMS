<?php

namespace Modules\Kaizen\Controllers;

use App\Controllers\BaseController;
use Modules\Kaizen\Models\KaizenSubmissionModel;

class KaizenController extends BaseController
{
    protected $model;

    public function __construct()
    {
        $this->model = new KaizenSubmissionModel();
    }

    /**
     * Helper to get request data from JSON or POST/raw input
     */
    private function getRequestData()
    {
        $json = $this->request->getJSON(true);
        if (!empty($json)) {
            return $json;
        }
        return array_merge($this->request->getPost(), $this->request->getRawInput());
    }

    /**
     * Helper to safely parse JSON into arrays
     */
    private function safeJsonParse($jsonString, $defaultValue = [])
    {
        if (empty($jsonString)) {
            return $defaultValue;
        }
        if (is_array($jsonString)) {
            return $jsonString;
        }
        $decoded = json_decode($jsonString, true);
        return is_array($decoded) ? $decoded : (!empty($jsonString) ? [$jsonString] : $defaultValue);
    }

    /**
     * Helper to format a single submission record for JSON output
     */
    private function formatSubmission(array $submission)
    {
        $submission['id'] = (int)$submission['id'];
        $submission['photos_before'] = $this->safeJsonParse($submission['photos_before'] ?? null);
        $submission['photos_after'] = $this->safeJsonParse($submission['photos_after'] ?? null);

        $numericFields = [
            'pph_before', 'pph_after', 'tct_before', 'tct_after',
            'rft_before', 'rft_after', 'saving_cost'
        ];
        foreach ($numericFields as $field) {
            if (isset($submission[$field]) && $submission[$field] !== null) {
                $submission[$field] = (float)$submission[$field];
            }
        }

        if (isset($submission['test_quantity']) && $submission['test_quantity'] !== null) {
            $submission['test_quantity'] = (int)$submission['test_quantity'];
        }

        if (isset($submission['point']) && $submission['point'] !== null) {
            $submission['point'] = (int)$submission['point'];
        }

        if (isset($submission['is_implemented'])) {
            $submission['is_implemented'] = filter_var($submission['is_implemented'], FILTER_VALIDATE_BOOLEAN);
        }

        return $submission;
    }

    /**
     * Helper to format multiple submissions
     */
    private function formatSubmissions(array $submissions)
    {
        return array_map([$this, 'formatSubmission'], $submissions);
    }

    /**
     * Get all kaizen submissions
     */
    public function getAllSubmissions()
    {
        try {
            $status = $this->request->getGet('status');
            $month = $this->request->getGet('month');
            $year = $this->request->getGet('year');
            $department = $this->request->getGet('department');
            $implemented = $this->request->getGet('implemented');

            $builder = $this->model->builder();

            if (!empty($status)) {
                $builder->where('validation_status', $status);
            }

            if (!empty($department)) {
                $builder->where('department', $department);
            }

            if ($implemented !== null && $implemented !== '') {
                $builder->where('is_implemented', $implemented === 'true');
            }

            if (!empty($year)) {
                if (!empty($month)) {
                    $builder->where("EXTRACT(MONTH FROM submission_date) =", (int)$month);
                    $builder->where("EXTRACT(YEAR FROM submission_date) =", (int)$year);
                } else {
                    $builder->where("EXTRACT(YEAR FROM submission_date) =", (int)$year);
                }
            }

            $builder->orderBy('createdAt', 'DESC');
            $submissions = $builder->get()->getResultArray();

            return $this->response->setJSON($this->formatSubmissions($submissions));
        } catch (\Exception $e) {
            return $this->response->setJSON(['message' => $e->getMessage()])->setStatusCode(500);
        }
    }

    /**
     * Get Pass OK submissions (master data)
     */
    public function getPassOkSubmissions()
    {
        try {
            $department = $this->request->getGet('department');
            $search = $this->request->getGet('search');
            $page = (int)($this->request->getGet('page') ?: 1);
            $limit = (int)($this->request->getGet('limit') ?: 10);

            $builder = $this->model->builder();
            $builder->where('validation_status', 'Pass OK');

            if (!empty($department)) {
                $builder->where('department', $department);
            }

            if (!empty($search)) {
                $builder->groupStart()
                        ->like('kaizen_title', $search, 'both', null, true)
                        ->orLike('pic_name', $search, 'both', null, true)
                        ->orLike('department', $search, 'both', null, true)
                        ->orLike('benefits', $search, 'both', null, true)
                        ->groupEnd();
            }

            $total = $builder->countAllResults(false);

            $offset = ($page - 1) * $limit;
            $builder->orderBy('submission_date', 'DESC');
            $builder->limit($limit, $offset);

            $submissions = $builder->get()->getResultArray();

            // Get unique departments
            $deptBuilder = $this->model->db->table('KaizenSubmissions');
            $deptBuilder->select('DISTINCT(department) as department');
            $deptBuilder->where('validation_status', 'Pass OK');
            $deptBuilder->orderBy('department', 'ASC');
            $deptRows = $deptBuilder->get()->getResultArray();
            $departments = array_filter(array_column($deptRows, 'department'));

            return $this->response->setJSON([
                'submissions' => $this->formatSubmissions($submissions),
                'pagination' => [
                    'total' => $total,
                    'page' => $page,
                    'limit' => $limit,
                    'totalPages' => ceil($total / $limit)
                ],
                'departments' => array_values($departments)
            ]);
        } catch (\Exception $e) {
            return $this->response->setJSON(['message' => $e->getMessage()])->setStatusCode(500);
        }
    }

    /**
     * Get submission by ID
     */
    public function getSubmissionById($id = null)
    {
        try {
            $submission = $this->model->find($id);
            if (!$submission) {
                return $this->response->setJSON(['message' => 'Kaizen submission not found'])->setStatusCode(404);
            }
            return $this->response->setJSON($this->formatSubmission($submission));
        } catch (\Exception $e) {
            return $this->response->setJSON(['message' => $e->getMessage()])->setStatusCode(500);
        }
    }

    /**
     * Get submission by ticket number
     */
    public function getSubmissionByTicket($ticket = null)
    {
        try {
            $submission = $this->model->where('ticket_number', $ticket)->first();
            if (!$submission) {
                return $this->response->setJSON(['message' => 'Kaizen submission not found'])->setStatusCode(404);
            }
            return $this->response->setJSON($this->formatSubmission($submission));
        } catch (\Exception $e) {
            return $this->response->setJSON(['message' => $e->getMessage()])->setStatusCode(500);
        }
    }

    /**
     * Create new submission
     */
    public function createSubmission()
    {
        try {
            // Generate ticket number
            $year = date('Y');
            $month = date('m');
            $startDate = "{$year}-{$month}-01 00:00:00";
            $endDate = date('Y-m-t 23:59:59', strtotime($startDate));

            $count = $this->model->where('createdAt >=', $startDate)
                                ->where('createdAt <=', $endDate)
                                ->countAllResults();

            $seq = str_pad($count + 1, 4, '0', STR_PAD_LEFT);
            $ticketNumber = "KZ-{$year}{$month}-{$seq}";

            $post = $this->request->getPost();

            // Handle file uploads
            $photosBeforeUrls = [];
            $photosAfterUrls = [];
            $files = $this->request->getFiles();

            if (isset($files['photosBefore'])) {
                $beforeFiles = $files['photosBefore'];
                if (is_array($beforeFiles)) {
                    foreach ($beforeFiles as $file) {
                        if ($file->isValid() && !$file->hasMoved()) {
                            $uploadDir = FCPATH . 'uploads/before/';
                            if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);
                            $newName = $file->getRandomName();
                            $file->move($uploadDir, $newName);
                            $photosBeforeUrls[] = '/uploads/before/' . $newName;
                        }
                    }
                } else if ($beforeFiles->isValid() && !$beforeFiles->hasMoved()) {
                    $uploadDir = FCPATH . 'uploads/before/';
                    if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);
                    $newName = $beforeFiles->getRandomName();
                    $beforeFiles->move($uploadDir, $newName);
                    $photosBeforeUrls[] = '/uploads/before/' . $newName;
                }
            }

            if (isset($files['photosAfter'])) {
                $afterFiles = $files['photosAfter'];
                if (is_array($afterFiles)) {
                    foreach ($afterFiles as $file) {
                        if ($file->isValid() && !$file->hasMoved()) {
                            $uploadDir = FCPATH . 'uploads/after/';
                            if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);
                            $newName = $file->getRandomName();
                            $file->move($uploadDir, $newName);
                            $photosAfterUrls[] = '/uploads/after/' . $newName;
                        }
                    }
                } else if ($afterFiles->isValid() && !$afterFiles->hasMoved()) {
                    $uploadDir = FCPATH . 'uploads/after/';
                    if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);
                    $newName = $afterFiles->getRandomName();
                    $afterFiles->move($uploadDir, $newName);
                    $photosAfterUrls[] = '/uploads/after/' . $newName;
                }
            }

            $submissionData = [
                'ticket_number' => $ticketNumber,
                'kaizen_title' => $post['kaizen_title'] ?? '',
                'pic_name' => $post['pic_name'] ?? '',
                'department' => $post['department'] ?? '',
                'submission_date' => $post['submission_date'] ?? date('Y-m-d H:i:s'),
                'background' => $post['background'] ?? '',
                'kaizen_type' => $post['kaizen_type'] ?? '',
                'erc_team' => $post['erc_team'] ?? null,
                'sku' => $post['sku'] ?? null,
                'photos_before' => json_encode($photosBeforeUrls),
                'photos_after' => json_encode($photosAfterUrls),
                'before_description' => $post['before_description'] ?? '',
                'after_description' => $post['after_description'] ?? '',
                'benefits' => $post['benefits'] ?? '',
                'process_impact' => $post['process_impact'] ?? null,
                'quality_impact' => $post['quality_impact'] ?? null,
                'pph_impact' => $post['pph_impact'] ?? null,
                'cost_impact' => $post['cost_impact'] ?? null,
                'validation_status' => 'Pending',
                'is_implemented' => isset($post['is_implemented']) ? ($post['is_implemented'] === 'true' || $post['is_implemented'] === '1' || $post['is_implemented'] === true) : false,
                'proposers_signature' => $post['proposers_signature'] ?? null,
                'spv_production_signature' => $post['spv_production_signature'] ?? null,
                'kb_production_signature' => $post['kb_production_signature'] ?? null,
                'asst_manager_production_signature' => $post['asst_manager_production_signature'] ?? null,
                'manager_production_signature' => $post['manager_production_signature'] ?? null,
                'production_technical_signature' => $post['production_technical_signature'] ?? null,
                'qms_signature' => $post['qms_signature'] ?? null,
                'director_production_signature' => $post['director_production_signature'] ?? null,
                'point' => 0
            ];

            $id = $this->model->insert($submissionData);
            $submission = $this->model->find($id);

            return $this->response->setJSON([
                'message' => 'Kaizen submission created successfully',
                'ticket_number' => $ticketNumber,
                'submission' => $this->formatSubmission($submission)
            ])->setStatusCode(201);

        } catch (\Exception $e) {
            return $this->response->setJSON(['message' => $e->getMessage()])->setStatusCode(400);
        }
    }

    /**
     * Update submission
     */
    public function updateSubmission($id = null)
    {
        try {
            if (strpos($id, 'KZ-') !== false) {
                $submission = $this->model->where('ticket_number', $id)->first();
            } else {
                $submission = $this->model->find($id);
            }

            if (!$submission) {
                return $this->response->setJSON(['message' => 'Kaizen submission not found'])->setStatusCode(404);
            }

            $post = $this->request->getPost();

            // Existing photos
            $existingBefore = $post['existing_photos_before'] ?? null;
            $existingAfter = $post['existing_photos_after'] ?? null;

            $beforeUrls = [];
            if (!empty($existingBefore)) {
                $decoded = json_decode($existingBefore, true);
                $beforeUrls = is_array($decoded) ? $decoded : [$existingBefore];
            }

            $afterUrls = [];
            if (!empty($existingAfter)) {
                $decoded = json_decode($existingAfter, true);
                $afterUrls = is_array($decoded) ? $decoded : [$existingAfter];
            }

            // Upload new photos
            $newBeforeUrls = [];
            $newAfterUrls = [];
            $files = $this->request->getFiles();

            if (isset($files['photosBefore'])) {
                $beforeFiles = $files['photosBefore'];
                if (is_array($beforeFiles)) {
                    foreach ($beforeFiles as $file) {
                        if ($file->isValid() && !$file->hasMoved()) {
                            $uploadDir = FCPATH . 'uploads/before/';
                            if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);
                            $newName = $file->getRandomName();
                            $file->move($uploadDir, $newName);
                            $newBeforeUrls[] = '/uploads/before/' . $newName;
                        }
                    }
                } else if ($beforeFiles->isValid() && !$beforeFiles->hasMoved()) {
                    $uploadDir = FCPATH . 'uploads/before/';
                    if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);
                    $newName = $beforeFiles->getRandomName();
                    $beforeFiles->move($uploadDir, $newName);
                    $newBeforeUrls[] = '/uploads/before/' . $newName;
                }
            }

            if (isset($files['photosAfter'])) {
                $afterFiles = $files['photosAfter'];
                if (is_array($afterFiles)) {
                    foreach ($afterFiles as $file) {
                        if ($file->isValid() && !$file->hasMoved()) {
                            $uploadDir = FCPATH . 'uploads/after/';
                            if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);
                            $newName = $file->getRandomName();
                            $file->move($uploadDir, $newName);
                            $newAfterUrls[] = '/uploads/after/' . $newName;
                        }
                    }
                } else if ($afterFiles->isValid() && !$afterFiles->hasMoved()) {
                    $uploadDir = FCPATH . 'uploads/after/';
                    if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);
                    $newName = $afterFiles->getRandomName();
                    $afterFiles->move($uploadDir, $newName);
                    $newAfterUrls[] = '/uploads/after/' . $newName;
                }
            }

            $allBefore = array_merge($beforeUrls, $newBeforeUrls);
            $allAfter = array_merge($afterUrls, $newAfterUrls);

            $updateData = [];

            // Simple loop to assign values from post
            $allowedKeys = [
                'kaizen_title', 'pic_name', 'department', 'submission_date', 'background',
                'kaizen_type', 'erc_team', 'sku', 'before_description', 'after_description',
                'benefits', 'process_impact', 'quality_impact', 'pph_impact', 'cost_impact'
            ];

            foreach ($allowedKeys as $key) {
                if (isset($post[$key])) {
                    $updateData[$key] = $post[$key];
                }
            }

            $updateData['photos_before'] = json_encode($allBefore);
            $updateData['photos_after'] = json_encode($allAfter);

            if (isset($post['is_implemented'])) {
                $updateData['is_implemented'] = ($post['is_implemented'] === 'true' || $post['is_implemented'] === '1' || $post['is_implemented'] === true);
            }

            // Numeric fields
            $numericFields = [
                'pph_before', 'pph_after', 'tct_before', 'tct_after',
                'rft_before', 'rft_after', 'saving_cost'
            ];
            foreach ($numericFields as $field) {
                if (isset($post[$field])) {
                    $updateData[$field] = $post[$field] !== '' ? (float)$post[$field] : null;
                }
            }

            // Signatures
            $signatures = [
                'proposers_signature', 'spv_production_signature', 'kb_production_signature',
                'asst_manager_production_signature', 'manager_production_signature',
                'production_technical_signature', 'qms_signature', 'director_production_signature'
            ];
            foreach ($signatures as $sig) {
                if (isset($post[$sig])) {
                    $updateData[$sig] = $post[$sig];
                }
            }

            $this->model->update($submission['id'], $updateData);
            $updated = $this->model->find($submission['id']);

            return $this->response->setJSON($this->formatSubmission($updated));
        } catch (\Exception $e) {
            return $this->response->setJSON(['message' => $e->getMessage()])->setStatusCode(400);
        }
    }

    /**
     * Update impact metrics
     */
    public function updateImpactMetrics($id = null)
    {
        try {
            if (strpos($id, 'KZ-') !== false) {
                $submission = $this->model->where('ticket_number', $id)->first();
            } else {
                $submission = $this->model->find($id);
            }

            if (!$submission) {
                return $this->response->setJSON(['message' => 'Kaizen submission not found'])->setStatusCode(404);
            }

            $data = $this->getRequestData();
            $updates = [];

            $fields = ['pph_before', 'pph_after', 'tct_before', 'tct_after', 'rft_before', 'rft_after', 'saving_cost'];
            foreach ($fields as $field) {
                if (isset($data[$field]) && $data[$field] !== '') {
                    $updates[$field] = (float)$data[$field];
                }
            }

            if (isset($data['is_implemented'])) {
                $updates['is_implemented'] = ($data['is_implemented'] === 'true' || $data['is_implemented'] === true || $data['is_implemented'] === 1);
            }

            if (!empty($updates)) {
                $this->model->update($submission['id'], $updates);
            }

            $updated = $this->model->find($submission['id']);
            return $this->response->setJSON($this->formatSubmission($updated));
        } catch (\Exception $e) {
            return $this->response->setJSON(['message' => $e->getMessage()])->setStatusCode(400);
        }
    }

    /**
     * Remove specific photo from submission
     */
    public function removePhoto($id = null)
    {
        try {
            if (strpos($id, 'KZ-') !== false) {
                $submission = $this->model->where('ticket_number', $id)->first();
            } else {
                $submission = $this->model->find($id);
            }

            if (!$submission) {
                return $this->response->setJSON(['message' => 'Kaizen submission not found'])->setStatusCode(404);
            }

            $photoUrl = $this->request->getGet('photoUrl');
            $photoType = $this->request->getGet('photoType');

            if (empty($photoUrl)) {
                return $this->response->setJSON(['message' => 'Photo URL is required'])->setStatusCode(400);
            }

            if ($photoType !== 'before' && $photoType !== 'after') {
                return $this->response->setJSON(['message' => 'Valid photoType (before/after) is required'])->setStatusCode(400);
            }

            $field = ($photoType === 'before') ? 'photos_before' : 'photos_after';
            $currentPhotos = $this->safeJsonParse($submission[$field] ?? null);

            $decodedPhotoUrl = urldecode($photoUrl);
            if (!in_array($decodedPhotoUrl, $currentPhotos)) {
                return $this->response->setJSON(['message' => 'Photo not found in submission'])->setStatusCode(404);
            }

            // Remove photo from array
            $updatedPhotos = array_values(array_filter($currentPhotos, function($url) use ($decodedPhotoUrl) {
                return $url !== $decodedPhotoUrl;
            }));

            // Delete local file if it exists
            $photoPath = FCPATH . ltrim($decodedPhotoUrl, '/');
            if (file_exists($photoPath) && is_file($photoPath)) {
                unlink($photoPath);
            }

            // Save back to db
            $this->model->update($submission['id'], [$field => json_encode($updatedPhotos)]);
            $updated = $this->model->find($submission['id']);

            return $this->response->setJSON([
                'message' => 'Photo removed successfully',
                'submission' => $this->formatSubmission($updated)
            ]);
        } catch (\Exception $e) {
            return $this->response->setJSON(['message' => $e->getMessage()])->setStatusCode(500);
        }
    }

    /**
     * Update validation status
     */
    public function updateValidationStatus($id = null)
    {
        try {
            if (strpos($id, 'KZ-') !== false) {
                $submission = $this->model->where('ticket_number', $id)->first();
            } else {
                $submission = $this->model->find($id);
            }

            if (!$submission) {
                return $this->response->setJSON(['message' => 'Kaizen submission not found'])->setStatusCode(404);
            }

            $data = $this->getRequestData();

            $updates = [];
            if (isset($data['validation_status'])) {
                $updates['validation_status'] = $data['validation_status'];
            }
            if (isset($data['test_date'])) {
                $updates['test_date'] = empty($data['test_date']) ? null : $data['test_date'];
            }
            if (isset($data['test_quantity'])) {
                $updates['test_quantity'] = $data['test_quantity'] !== '' ? (int)$data['test_quantity'] : null;
            }
            if (isset($data['test_result'])) {
                $updates['test_result'] = $data['test_result'];
            }

            if (!empty($updates)) {
                $this->model->update($submission['id'], $updates);
            }

            $updated = $this->model->find($submission['id']);
            return $this->response->setJSON($this->formatSubmission($updated));
        } catch (\Exception $e) {
            return $this->response->setJSON(['message' => $e->getMessage()])->setStatusCode(400);
        }
    }

    /**
     * Update points
     */
    public function updatePoint($id = null)
    {
        try {
            if (strpos($id, 'KZ-') !== false) {
                $submission = $this->model->where('ticket_number', $id)->first();
            } else {
                $submission = $this->model->find($id);
            }

            if (!$submission) {
                return $this->response->setJSON(['message' => 'Kaizen submission not found'])->setStatusCode(404);
            }

            $data = $this->getRequestData();

            if (isset($data['point'])) {
                $this->model->update($submission['id'], ['point' => (int)$data['point']]);
            }

            $updated = $this->model->find($submission['id']);
            return $this->response->setJSON($this->formatSubmission($updated));
        } catch (\Exception $e) {
            return $this->response->setJSON(['message' => $e->getMessage()])->setStatusCode(400);
        }
    }

    /**
     * Delete submission
     */
    public function deleteSubmission($id = null)
    {
        try {
            if (strpos($id, 'KZ-') !== false) {
                $submission = $this->model->where('ticket_number', $id)->first();
            } else {
                $submission = $this->model->find($id);
            }

            if (!$submission) {
                return $this->response->setJSON(['message' => 'Kaizen submission not found'])->setStatusCode(404);
            }

            // Delete photos
            $photosBefore = $this->safeJsonParse($submission['photos_before'] ?? null);
            foreach ($photosBefore as $url) {
                $photoPath = FCPATH . ltrim($url, '/');
                if (file_exists($photoPath) && is_file($photoPath)) {
                    unlink($photoPath);
                }
            }

            $photosAfter = $this->safeJsonParse($submission['photos_after'] ?? null);
            foreach ($photosAfter as $url) {
                $photoPath = FCPATH . ltrim($url, '/');
                if (file_exists($photoPath) && is_file($photoPath)) {
                    unlink($photoPath);
                }
            }

            $this->model->delete($submission['id']);

            return $this->response->setJSON(['message' => 'Kaizen submission deleted successfully']);
        } catch (\Exception $e) {
            return $this->response->setJSON(['message' => $e->getMessage()])->setStatusCode(500);
        }
    }

    /**
     * Get Stats for dashboard
     */
    public function getStats()
    {
        try {
            $currentYear = date('Y');
            $currentMonth = date('m');

            $totalSubmissions = $this->model->countAllResults();

            // Submissions this month
            $submissionsThisMonth = $this->model
                ->where("EXTRACT(YEAR FROM submission_date) =", (int)$currentYear)
                ->where("EXTRACT(MONTH FROM submission_date) =", (int)$currentMonth)
                ->countAllResults();

            // Status counts
            $pending = $this->model->where('validation_status', 'Pending')->countAllResults();
            $approved = $this->model->whereIn('validation_status', ['Approved', 'Pass OK'])->countAllResults();
            $rejected = $this->model->where('validation_status', 'Rejected')->countAllResults();

            // Submissions by department
            $builderDept = $this->model->builder();
            $builderDept->select('department, COUNT(id) as count');
            $builderDept->groupBy('department');
            $builderDept->orderBy('count', 'DESC');
            $submissionsByDept = $builderDept->get()->getResultArray();

            $submissionsByDepartment = [];
            foreach ($submissionsByDept as $row) {
                $submissionsByDepartment[] = [
                    'department' => $row['department'],
                    'count' => (int)$row['count']
                ];
            }

            // Submissions by month for current year
            $builderMonth = $this->model->builder();
            $builderMonth->select('EXTRACT(MONTH FROM submission_date) as month, COUNT(id) as count');
            $builderMonth->where("EXTRACT(YEAR FROM submission_date) =", (int)$currentYear);
            $builderMonth->groupBy('month');
            $builderMonth->orderBy('month', 'ASC');
            $submissionsByM = $builderMonth->get()->getResultArray();

            $submissionsByMonth = [];
            foreach ($submissionsByM as $row) {
                $submissionsByMonth[] = [
                    'month' => (float)$row['month'],
                    'count' => (int)$row['count']
                ];
            }

            return $this->response->setJSON([
                'totalSubmissions' => $totalSubmissions,
                'submissionsThisMonth' => $submissionsThisMonth,
                'statusCounts' => [
                    'pending' => $pending,
                    'approved' => $approved,
                    'rejected' => $rejected
                ],
                'submissionsByDepartment' => $submissionsByDepartment,
                'submissionsByMonth' => $submissionsByMonth
            ]);
        } catch (\Exception $e) {
            return $this->response->setJSON(['message' => $e->getMessage()])->setStatusCode(500);
        }
    }

    /**
     * Get rankings
     */
    public function getRankings()
    {
        try {
            $timeframe = $this->request->getGet('timeframe') ?: 'all-time';
            $month = $this->request->getGet('month');
            $year = $this->request->getGet('year');

            $db = $this->model->db;

            $qAll = $db->table('KaizenSubmissions')
                       ->select('pic_name, COUNT(id) as total_submissions, COALESCE(SUM("point"), 0) as total_points');

            $qPassed = $db->table('KaizenSubmissions')
                          ->select('pic_name, COUNT(id) as passed_submissions')
                          ->where('validation_status', 'Pass OK');

            // Apply filters
            if ($timeframe === 'monthly') {
                $currentMonth = date('m');
                $currentYear = date('Y');
                $qAll->where('EXTRACT(MONTH FROM submission_date) =', $currentMonth)
                     ->where('EXTRACT(YEAR FROM submission_date) =', $currentYear);
                $qPassed->where('EXTRACT(MONTH FROM submission_date) =', $currentMonth)
                        ->where('EXTRACT(YEAR FROM submission_date) =', $currentYear);
            } else if ($timeframe === 'yearly') {
                $currentYear = date('Y');
                $qAll->where('EXTRACT(YEAR FROM submission_date) =', $currentYear);
                $qPassed->where('EXTRACT(YEAR FROM submission_date) =', $currentYear);
            } else if ($timeframe === 'year-only' && !empty($year)) {
                $qAll->where('EXTRACT(YEAR FROM submission_date) =', (int)$year);
                $qPassed->where('EXTRACT(YEAR FROM submission_date) =', (int)$year);
            } else if ($timeframe === 'specific' && !empty($month) && !empty($year)) {
                $qAll->where('EXTRACT(MONTH FROM submission_date) =', (int)$month)
                     ->where('EXTRACT(YEAR FROM submission_date) =', (int)$year);
                $qPassed->where('EXTRACT(MONTH FROM submission_date) =', (int)$month)
                        ->where('EXTRACT(YEAR FROM submission_date) =', (int)$year);
            }

            $allSubmissions = $qAll->groupBy('pic_name')->get()->getResultArray();
            $passedSubmissions = $qPassed->groupBy('pic_name')->get()->getResultArray();

            $passedMap = [];
            foreach ($passedSubmissions as $row) {
                $passedMap[$row['pic_name']] = (int)$row['passed_submissions'];
            }

            $rankings = [];
            foreach ($allSubmissions as $row) {
                $picName = $row['pic_name'];
                $totalCount = (int)$row['total_submissions'];
                $totalPoints = (int)$row['total_points'];
                $passedCount = $passedMap[$picName] ?? 0;

                // Points calculation: 1 pt per submission + sum of point values
                $points = $totalCount + $totalPoints;

                $rankings[] = [
                    'pic_name' => $picName,
                    'total_submissions' => $totalCount,
                    'passed_submissions' => $passedCount,
                    'additional_points' => $totalPoints,
                    'points' => $points
                ];
            }

            // Sort DESC by points
            usort($rankings, function($a, $b) {
                return $b['points'] <=> $a['points'];
            });

            // Add ranks
            foreach ($rankings as $idx => &$item) {
                $item['rank'] = $idx + 1;
            }

            // Total participants count
            $qParticipants = $db->table('KaizenSubmissions')
                                ->select('COUNT(DISTINCT(pic_name)) as total_participants');
            if ($timeframe === 'monthly') {
                $currentMonth = date('m');
                $currentYear = date('Y');
                $qParticipants->where('EXTRACT(MONTH FROM submission_date) =', $currentMonth)
                              ->where('EXTRACT(YEAR FROM submission_date) =', $currentYear);
            } else if ($timeframe === 'yearly') {
                $currentYear = date('Y');
                $qParticipants->where('EXTRACT(YEAR FROM submission_date) =', $currentYear);
            } else if ($timeframe === 'year-only' && !empty($year)) {
                $qParticipants->where('EXTRACT(YEAR FROM submission_date) =', (int)$year);
            } else if ($timeframe === 'specific' && !empty($month) && !empty($year)) {
                $qParticipants->where('EXTRACT(MONTH FROM submission_date) =', (int)$month)
                              ->where('EXTRACT(YEAR FROM submission_date) =', (int)$year);
            }
            $pRow = $qParticipants->get()->getRowArray();
            $totalParticipants = (int)($pRow['total_participants'] ?? 0);

            return $this->response->setJSON([
                'timeframe' => $timeframe,
                'month' => $month,
                'year' => $year,
                'total_participants' => $totalParticipants,
                'rankings' => $rankings
            ]);
        } catch (\Exception $e) {
            return $this->response->setJSON(['message' => $e->getMessage()])->setStatusCode(500);
        }
    }

    /**
     * Export to Excel (CSV format matching existing LMS CSV exports)
     */
    public function exportToExcel()
    {
        try {
            $month = $this->request->getGet('month');
            $year = $this->request->getGet('year');
            $department = $this->request->getGet('department');
            $status = $this->request->getGet('status') ?: 'Pass OK';
            $implemented = $this->request->getGet('implemented');

            $builder = $this->model->builder();
            $builder->where('validation_status', $status);

            if (!empty($department)) {
                $builder->where('department', $department);
            }

            if ($implemented !== null && $implemented !== '') {
                $builder->where('is_implemented', $implemented === 'true');
            }

            if (!empty($year)) {
                if (!empty($month)) {
                    $builder->where('EXTRACT(MONTH FROM submission_date) =', (int)$month);
                    $builder->where('EXTRACT(YEAR FROM submission_date) =', (int)$year);
                } else {
                    $builder->where('EXTRACT(YEAR FROM submission_date) =', (int)$year);
                }
            }

            $builder->orderBy('department', 'ASC');
            $builder->orderBy('submission_date', 'ASC');

            $submissions = $builder->get()->getResultArray();

            $monthName = $month ? date("F", mktime(0, 0, 0, $month, 10)) : "AllTime";
            $fileName = "Kaizen_Submissions_PassOK_" . $monthName . "_" . ($year ?? "All") . ".csv";

            // Set headers for CSV download
            header('Content-Type: text/csv; charset=utf-8');
            header('Content-Disposition: attachment; filename="' . $fileName . '"');

            $output = fopen('php://output', 'w');
            
            // UTF-8 BOM
            fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));

            // Write Title
            fputcsv($output, ["KAIZEN TRACKING SYSTEM SUMMARY REPORT"]);
            fputcsv($output, ["$monthName " . ($year ?? "")]);
            
            $implementedCount = 0;
            foreach ($submissions as $s) {
                if (filter_var($s['is_implemented'], FILTER_VALIDATE_BOOLEAN)) {
                    $implementedCount++;
                }
            }
            $notImplementedCount = count($submissions) - $implementedCount;
            fputcsv($output, ["Implemented: $implementedCount | Not Implemented: $notImplementedCount | Total: " . count($submissions)]);
            fputcsv($output, []); // empty row

            // Write Headers
            fputcsv($output, [
                "No", "Month", "Kaizen Title", "Suggested By", "Department", 
                "Photo Before", "Photo After", "Benefit", "Impact Assessment", 
                "PPH Before", "PPH After", "PPH Calculation", 
                "RFT Before", "RFT After", "RFT Calculation", 
                "TCT Before", "TCT After", "TCT Calculation", 
                "Saving Cost"
            ]);

            // Write Data
            foreach ($submissions as $index => $s) {
                $subDate = !empty($s['submission_date']) ? $s['submission_date'] : $s['createdAt'];
                $monthStr = !empty($subDate) ? strtoupper(date('M-y', strtotime($subDate))) : '';

                // Photos string
                $pb = $this->safeJsonParse($s['photos_before'] ?? null);
                $pbStr = !empty($pb) ? base_url($pb[0]) : '';

                $pa = $this->safeJsonParse($s['photos_after'] ?? null);
                $paStr = !empty($pa) ? base_url($pa[0]) : '';

                // Calculate differences
                $pphBefore = $s['pph_before'] !== null ? (float)$s['pph_before'] : null;
                $pphAfter = $s['pph_after'] !== null ? (float)$s['pph_after'] : null;
                $pphCalc = ($pphAfter !== null && $pphBefore !== null) ? ($pphAfter - $pphBefore) : null;

                $rftBefore = $s['rft_before'] !== null ? (float)$s['rft_before'] : null;
                $rftAfter = $s['rft_after'] !== null ? (float)$s['rft_after'] : null;
                $rftCalc = ($rftAfter !== null && $rftBefore !== null) ? ($rftAfter - $rftBefore) : null;

                $tctBefore = $s['tct_before'] !== null ? (float)$s['tct_before'] : null;
                $tctAfter = $s['tct_after'] !== null ? (float)$s['tct_after'] : null;
                $tctCalc = ($tctAfter !== null && $tctBefore !== null) ? ($tctBefore - $tctAfter) : null; // Lower is better

                $impacts = [];
                if (!empty($s['process_impact'])) $impacts[] = "Process: " . $s['process_impact'];
                if (!empty($s['quality_impact'])) $impacts[] = "Quality: " . $s['quality_impact'];
                if (!empty($s['pph_impact'])) $impacts[] = "PPH: " . $s['pph_impact'];
                if (!empty($s['cost_impact'])) $impacts[] = "Cost: " . $s['cost_impact'];
                $impactStr = implode(" | ", $impacts);

                fputcsv($output, [
                    $index + 1,
                    $monthStr,
                    $s['kaizen_title'],
                    $s['pic_name'],
                    $s['department'],
                    $pbStr,
                    $paStr,
                    $s['benefits'],
                    $impactStr,
                    $pphBefore !== null ? number_format($pphBefore, 2) : '',
                    $pphAfter !== null ? number_format($pphAfter, 2) : '',
                    $pphCalc !== null ? number_format($pphCalc, 2) : '',
                    $rftBefore !== null ? number_format($rftBefore, 2) : '',
                    $rftAfter !== null ? number_format($rftAfter, 2) : '',
                    $rftCalc !== null ? number_format($rftCalc, 2) : '',
                    $tctBefore !== null ? number_format($tctBefore, 2) : '',
                    $tctAfter !== null ? number_format($tctAfter, 2) : '',
                    $tctCalc !== null ? number_format($tctCalc, 2) : '',
                    $s['saving_cost'] !== null ? number_format((float)$s['saving_cost'], 2) : ''
                ]);
            }

            fclose($output);
            exit();
        } catch (\Exception $e) {
            return $this->response->setJSON([
                'message' => 'Error exporting submissions',
                'error' => $e->getMessage()
            ])->setStatusCode(500);
        }
    }

    /**
     * Render print-ready HTML ERC view
     */
    public function ercPdf($id = null)
    {
        try {
            $submission = $this->model->find($id);
            if (!$submission) {
                return $this->response->setBody("<h2>Submission not found</h2>")->setStatusCode(404);
            }

            $data = $submission;
            $data['photos_before'] = $this->safeJsonParse($submission['photos_before'] ?? null);
            $data['photos_after'] = $this->safeJsonParse($submission['photos_after'] ?? null);

            $data['submission_date_formatted'] = !empty($submission['submission_date']) 
                ? date('d/m/Y', strtotime($submission['submission_date'])) 
                : 'N/A';

            $data['test_date_formatted'] = !empty($submission['test_date']) 
                ? date('d-m-Y', strtotime($submission['test_date'])) 
                : 'N/A';

            return view('Modules\Kaizen\Views\erc_pdf', $data);
        } catch (\Exception $e) {
            return $this->response->setBody("<h2>Error rendering page: " . esc($e->getMessage()) . "</h2>")->setStatusCode(500);
        }
    }

    /**
     * Render print-ready HTML standard Kaizen view
     */
    public function kaizenPdf($id = null)
    {
        try {
            if (strpos($id, 'KZ-') !== false) {
                $submission = $this->model->where('ticket_number', $id)->first();
            } else {
                $submission = $this->model->find($id);
            }

            if (!$submission) {
                return $this->response->setBody("<h2>Submission not found</h2>")->setStatusCode(404);
            }

            $photosBefore = $this->safeJsonParse($submission['photos_before'] ?? null);
            $photosAfter = $this->safeJsonParse($submission['photos_after'] ?? null);

            $subDate = !empty($submission['submission_date']) ? $submission['submission_date'] : $submission['createdAt'];
            $submissionDateFormatted = !empty($subDate) ? date('Y-m-d', strtotime($subDate)) : 'N/A';

            $data = [
                'title' => "Kaizen Submission: " . $submission['ticket_number'],
                'date' => date('d/m/Y H:i'),
                'submission' => $submission,
                'photos_before' => $photosBefore,
                'photos_after' => $photosAfter,
                'submissionDateFormatted' => $submissionDateFormatted
            ];

            return view('Modules\Kaizen\Views\kaizen_pdf', $data);
        } catch (\Exception $e) {
            return $this->response->setBody("<h2>Error rendering page: " . esc($e->getMessage()) . "</h2>")->setStatusCode(500);
        }
    }
}
