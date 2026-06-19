<?php

namespace Modules\Audit6S\Controllers;

use App\Controllers\BaseController;
use Modules\Audit6S\Models\ProductionAuditModel;
use Modules\Audit6S\Models\AuditScheduleModel;

class ProductionAuditController extends BaseController
{
    protected $model;

    public function __construct()
    {
        $this->model = new ProductionAuditModel();
    }

    /**
     * Get all audits with filtering and ranking
     */
    public function getAllAudits()
    {
        try {
            $month = $this->request->getGet('month') ?: date('m');
            $year = $this->request->getGet('year') ?: date('Y');

            $builder = $this->model->db->table('ProductionAudits a');
            $builder->select('a.*, d.name as department_name, d.type as department_type, s.status as schedule_status');
            $builder->join('Departments d', 'd.id = a.department_id');
            $builder->join('AuditSchedules s', 's.id = a.schedule_id', 'left');
            $builder->where('d.type', 'production');
            $monthStr = str_pad($month, 2, '0', STR_PAD_LEFT);
            $startDate = "{$year}-{$monthStr}-01 00:00:00";
            $endDate = date('Y-m-t 23:59:59', strtotime($startDate));
            $builder->where('a.audit_date >=', $startDate);
            $builder->where('a.audit_date <=', $endDate);
            $builder->orderBy('(a.sort_score + a.set_in_order_score + a.shine_score + a.standardize_score + a.sustain_score + a.safety_score) / 6', 'DESC');

            $audits = $builder->get()->getResultArray();

            $formatted = [];
            foreach ($audits as $row) {
                $formatted[] = [
                    'id' => (int)$row['id'],
                    'schedule_id' => $row['schedule_id'] ? (int)$row['schedule_id'] : null,
                    'department_id' => (int)$row['department_id'],
                    'audit_date' => $row['audit_date'],
                    'auditor_name' => $row['auditor_name'],
                    'lean_facilitator_name' => $row['lean_facilitator_name'],
                    'previous_findings' => $row['previous_findings'],
                    'current_findings' => $row['current_findings'],
                    'sort_score' => $row['sort_score'] !== null ? (float)$row['sort_score'] : null,
                    'set_in_order_score' => $row['set_in_order_score'] !== null ? (float)$row['set_in_order_score'] : null,
                    'shine_score' => $row['shine_score'] !== null ? (float)$row['shine_score'] : null,
                    'standardize_score' => $row['standardize_score'] !== null ? (float)$row['standardize_score'] : null,
                    'sustain_score' => $row['sustain_score'] !== null ? (float)$row['sustain_score'] : null,
                    'safety_score' => $row['safety_score'] !== null ? (float)$row['safety_score'] : null,
                    'photo_url' => $row['photo_url'],
                    'auditor_signature' => $row['auditor_signature'],
                    'facilitator_signature' => $row['facilitator_signature'],
                    'department_signature' => $row['department_signature'],
                    'createdAt' => $row['createdAt'],
                    'updatedAt' => $row['updatedAt'],
                    'Department' => [
                        'id' => (int)$row['department_id'],
                        'name' => $row['department_name'],
                        'type' => $row['department_type']
                    ],
                    'AuditSchedule' => $row['schedule_id'] ? [
                        'id' => (int)$row['schedule_id'],
                        'status' => $row['schedule_status']
                    ] : null
                ];
            }

            if ($this->request->getGet('format') === 'excel') {
                $monthName = date("F", mktime(0, 0, 0, $month, 10));
                $fileName = "6s-ranking-production-" . $year . "-" . $month . ".csv";

                header('Content-Type: text/csv; charset=utf-8');
                header('Content-Disposition: attachment; filename="' . $fileName . '"');

                $output = fopen('php://output', 'w');
                fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF)); // BOM

                fputcsv($output, ["Ranking 6S Audit Production - $monthName $year"]);
                fputcsv($output, []);
                fputcsv($output, ["Rank", "Department", "Final Score"]);

                foreach ($formatted as $index => $audit) {
                    $finalScore = ($audit['sort_score'] + $audit['set_in_order_score'] + $audit['shine_score'] + $audit['standardize_score'] + $audit['sustain_score'] + $audit['safety_score']) / 6;
                    fputcsv($output, [
                        $index + 1,
                        $audit['Department']['name'],
                        number_format($finalScore, 2)
                    ]);
                }

                fclose($output);
                exit();
            }

            return $this->response->setJSON($formatted);
        } catch (\Exception $e) {
            return $this->response->setJSON(['message' => $e->getMessage()])->setStatusCode(500);
        }
    }

    /**
     * Get audit by ID
     */
    public function getAuditById($id = null)
    {
        try {
            $builder = $this->model->db->table('ProductionAudits a');
            $builder->select('a.*, d.name as department_name, d.type as department_type, s.status as schedule_status');
            $builder->join('Departments d', 'd.id = a.department_id');
            $builder->join('AuditSchedules s', 's.id = a.schedule_id', 'left');
            $builder->where('a.id', $id);
            $row = $builder->get()->getRowArray();

            if (!$row) {
                return $this->response->setJSON(['message' => 'Audit not found'])->setStatusCode(404);
            }

            $formatted = [
                'id' => (int)$row['id'],
                'schedule_id' => $row['schedule_id'] ? (int)$row['schedule_id'] : null,
                'department_id' => (int)$row['department_id'],
                'audit_date' => $row['audit_date'],
                'auditor_name' => $row['auditor_name'],
                'lean_facilitator_name' => $row['lean_facilitator_name'],
                'previous_findings' => $row['previous_findings'],
                'current_findings' => $row['current_findings'],
                'sort_score' => $row['sort_score'] !== null ? (float)$row['sort_score'] : null,
                'set_in_order_score' => $row['set_in_order_score'] !== null ? (float)$row['set_in_order_score'] : null,
                'shine_score' => $row['shine_score'] !== null ? (float)$row['shine_score'] : null,
                'standardize_score' => $row['standardize_score'] !== null ? (float)$row['standardize_score'] : null,
                'sustain_score' => $row['sustain_score'] !== null ? (float)$row['sustain_score'] : null,
                'safety_score' => $row['safety_score'] !== null ? (float)$row['safety_score'] : null,
                'photo_url' => $row['photo_url'],
                'auditor_signature' => $row['auditor_signature'],
                'facilitator_signature' => $row['facilitator_signature'],
                'department_signature' => $row['department_signature'],
                'createdAt' => $row['createdAt'],
                'updatedAt' => $row['updatedAt'],
                'Department' => [
                    'id' => (int)$row['department_id'],
                    'name' => $row['department_name'],
                    'type' => $row['department_type']
                ],
                'AuditSchedule' => $row['schedule_id'] ? [
                    'id' => (int)$row['schedule_id'],
                    'status' => $row['schedule_status']
                ] : null
            ];

            return $this->response->setJSON($formatted);
        } catch (\Exception $e) {
            return $this->response->setJSON(['message' => $e->getMessage()])->setStatusCode(500);
        }
    }

    /**
     * Get previous audit for a department before a specific date
     */
    public function getPreviousAudit()
    {
        try {
            $department_id = $this->request->getGet('department_id');
            $audit_date = $this->request->getGet('audit_date');

            if (!$department_id || !$audit_date) {
                return $this->response->setJSON(['message' => 'Department ID and audit date are required'])->setStatusCode(400);
            }

            $builder = $this->model->db->table('ProductionAudits a');
            $builder->select('a.*, d.name as department_name, d.type as department_type');
            $builder->join('Departments d', 'd.id = a.department_id');
            $builder->where('a.department_id', (int)$department_id);
            $builder->where('a.audit_date <', $audit_date);
            $builder->orderBy('a.audit_date', 'DESC');
            $builder->limit(1);

            $row = $builder->get()->getRowArray();

            if ($row) {
                $formatted = [
                    'id' => (int)$row['id'],
                    'schedule_id' => $row['schedule_id'] ? (int)$row['schedule_id'] : null,
                    'department_id' => (int)$row['department_id'],
                    'audit_date' => $row['audit_date'],
                    'auditor_name' => $row['auditor_name'],
                    'lean_facilitator_name' => $row['lean_facilitator_name'],
                    'previous_findings' => $row['previous_findings'],
                    'current_findings' => $row['current_findings'],
                    'sort_score' => $row['sort_score'] !== null ? (float)$row['sort_score'] : null,
                    'set_in_order_score' => $row['set_in_order_score'] !== null ? (float)$row['set_in_order_score'] : null,
                    'shine_score' => $row['shine_score'] !== null ? (float)$row['shine_score'] : null,
                    'standardize_score' => $row['standardize_score'] !== null ? (float)$row['standardize_score'] : null,
                    'sustain_score' => $row['sustain_score'] !== null ? (float)$row['sustain_score'] : null,
                    'safety_score' => $row['safety_score'] !== null ? (float)$row['safety_score'] : null,
                    'photo_url' => $row['photo_url'],
                    'auditor_signature' => $row['auditor_signature'],
                    'facilitator_signature' => $row['facilitator_signature'],
                    'department_signature' => $row['department_signature'],
                    'createdAt' => $row['createdAt'],
                    'updatedAt' => $row['updatedAt']
                ];
                return $this->response->setJSON($formatted);
            }

            return $this->response->setJSON(null);
        } catch (\Exception $e) {
            return $this->response->setJSON(['message' => $e->getMessage()])->setStatusCode(500);
        }
    }

    /**
     * Create production audit
     */
    public function createAudit()
    {
        try {
            $post = $this->request->getPost();

            // Handle uploads
            $photoUrls = [];
            $files = $this->request->getFiles();
            if (isset($files['photos'])) {
                $photos = $files['photos'];
                if (is_array($photos)) {
                    foreach ($photos as $file) {
                        if ($file->isValid() && !$file->hasMoved()) {
                            $uploadDir = FCPATH . 'uploads/';
                            if (!is_dir($uploadDir)) {
                                mkdir($uploadDir, 0777, true);
                            }
                            $newName = $file->getRandomName();
                            $file->move($uploadDir, $newName);
                            $photoUrls[] = '/uploads/' . $newName;
                        }
                    }
                } else {
                    if ($photos->isValid() && !$photos->hasMoved()) {
                        $uploadDir = FCPATH . 'uploads/';
                        if (!is_dir($uploadDir)) {
                            mkdir($uploadDir, 0777, true);
                        }
                        $newName = $photos->getRandomName();
                        $photos->move($uploadDir, $newName);
                        $photoUrls[] = '/uploads/' . $newName;
                    }
                }
            }

            $auditData = [
                'schedule_id' => isset($post['schedule_id']) ? (int)$post['schedule_id'] : null,
                'department_id' => (int)$post['department_id'],
                'audit_date' => $post['audit_date'],
                'auditor_name' => $post['auditor_name'],
                'lean_facilitator_name' => $post['lean_facilitator_name'],
                'previous_findings' => $post['previous_findings'] ?? '',
                'current_findings' => $post['current_findings'] ?? '',
                'sort_score' => isset($post['sort_score']) ? (float)$post['sort_score'] : 0,
                'set_in_order_score' => isset($post['set_in_order_score']) ? (float)$post['set_in_order_score'] : 0,
                'shine_score' => isset($post['shine_score']) ? (float)$post['shine_score'] : 0,
                'standardize_score' => isset($post['standardize_score']) ? (float)$post['standardize_score'] : 0,
                'sustain_score' => isset($post['sustain_score']) ? (float)$post['sustain_score'] : 0,
                'safety_score' => isset($post['safety_score']) ? (float)$post['safety_score'] : 0,
                'photo_url' => json_encode($photoUrls),
                'auditor_signature' => $post['auditor_signature'] ?? null,
                'facilitator_signature' => $post['facilitator_signature'] ?? null,
                'department_signature' => $post['department_signature'] ?? null,
            ];

            $id = $this->model->insert($auditData);

            // Update schedule status to completed
            if (!empty($post['schedule_id'])) {
                $scheduleModel = new AuditScheduleModel();
                $scheduleModel->update((int)$post['schedule_id'], ['status' => 'completed']);
            }

            $created = $this->model->find($id);
            return $this->response->setJSON($created)->setStatusCode(201);
        } catch (\Exception $e) {
            return $this->response->setJSON(['message' => $e->getMessage()])->setStatusCode(400);
        }
    }

    /**
     * Update production audit
     */
    public function updateAudit($id = null)
    {
        try {
            $audit = $this->model->find($id);
            if (!$audit) {
                return $this->response->setJSON(['message' => 'Audit not found'])->setStatusCode(404);
            }

            $post = $this->request->getPost();

            // Handle existing photos
            $existingPhotos = [];
            if (isset($post['existing_photos'])) {
                $existingPhotos = json_decode($post['existing_photos'], true) ?: [];
            } else {
                $existingPhotos = json_decode($audit['photo_url'], true) ?: [];
            }

            // Handle new uploads
            $newPhotoUrls = [];
            $files = $this->request->getFiles();
            if (isset($files['photos'])) {
                $photos = $files['photos'];
                if (is_array($photos)) {
                    foreach ($photos as $file) {
                        if ($file->isValid() && !$file->hasMoved()) {
                            $uploadDir = FCPATH . 'uploads/';
                            if (!is_dir($uploadDir)) {
                                mkdir($uploadDir, 0777, true);
                            }
                            $newName = $file->getRandomName();
                            $file->move($uploadDir, $newName);
                            $newPhotoUrls[] = '/uploads/' . $newName;
                        }
                    }
                } else {
                    if ($photos->isValid() && !$photos->hasMoved()) {
                        $uploadDir = FCPATH . 'uploads/';
                        if (!is_dir($uploadDir)) {
                            mkdir($uploadDir, 0777, true);
                        }
                        $newName = $photos->getRandomName();
                        $photos->move($uploadDir, $newName);
                        $newPhotoUrls[] = '/uploads/' . $newName;
                    }
                }
            }

            $allPhotos = array_merge($existingPhotos, $newPhotoUrls);

            $updateData = [];
            if (isset($post['department_id'])) $updateData['department_id'] = (int)$post['department_id'];
            if (isset($post['audit_date'])) $updateData['audit_date'] = $post['audit_date'];
            if (isset($post['auditor_name'])) $updateData['auditor_name'] = $post['auditor_name'];
            if (isset($post['lean_facilitator_name'])) $updateData['lean_facilitator_name'] = $post['lean_facilitator_name'];
            if (isset($post['previous_findings'])) $updateData['previous_findings'] = $post['previous_findings'];
            if (isset($post['current_findings'])) $updateData['current_findings'] = $post['current_findings'];
            if (isset($post['sort_score'])) $updateData['sort_score'] = (float)$post['sort_score'];
            if (isset($post['set_in_order_score'])) $updateData['set_in_order_score'] = (float)$post['set_in_order_score'];
            if (isset($post['shine_score'])) $updateData['shine_score'] = (float)$post['shine_score'];
            if (isset($post['standardize_score'])) $updateData['standardize_score'] = (float)$post['standardize_score'];
            if (isset($post['sustain_score'])) $updateData['sustain_score'] = (float)$post['sustain_score'];
            if (isset($post['safety_score'])) $updateData['safety_score'] = (float)$post['safety_score'];
            
            $updateData['photo_url'] = json_encode($allPhotos);

            if (isset($post['auditor_signature'])) $updateData['auditor_signature'] = $post['auditor_signature'];
            if (isset($post['facilitator_signature'])) $updateData['facilitator_signature'] = $post['facilitator_signature'];
            if (isset($post['department_signature'])) $updateData['department_signature'] = $post['department_signature'];

            $this->model->update($id, $updateData);
            $updated = $this->model->find($id);
            return $this->response->setJSON($updated);
        } catch (\Exception $e) {
            return $this->response->setJSON(['message' => $e->getMessage()])->setStatusCode(400);
        }
    }

    /**
     * Delete production audit
     */
    public function deleteAudit($id = null)
    {
        try {
            $audit = $this->model->find($id);
            if (!$audit) {
                return $this->response->setJSON(['message' => 'Audit not found'])->setStatusCode(404);
            }

            $this->model->delete($id);
            return $this->response->setJSON(['message' => 'Audit deleted successfully']);
        } catch (\Exception $e) {
            return $this->response->setJSON(['message' => $e->getMessage()])->setStatusCode(500);
        }
    }
}
