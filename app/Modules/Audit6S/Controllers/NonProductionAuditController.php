<?php

namespace Modules\Audit6S\Controllers;

use App\Controllers\BaseController;
use Modules\Audit6S\Models\NonProductionAuditModel;
use Modules\Audit6S\Models\AuditScheduleModel;

class NonProductionAuditController extends BaseController
{
    protected $model;

    public function __construct()
    {
        $this->model = new NonProductionAuditModel();
    }

    /**
     * Get all audits with filtering and ranking
     */
    public function getAllAudits()
    {
        try {
            $month = $this->request->getGet('month') ?: date('m');
            $year = $this->request->getGet('year') ?: date('Y');

            $builder = $this->model->db->table('NonProductionAudits a');
            $builder->select('a.*, d.name as department_name, d.type as department_type, s.status as schedule_status');
            $builder->join('Departments d', 'd.id = a.department_id');
            $builder->join('AuditSchedules s', 's.id = a.schedule_id', 'left');
            $builder->where('d.type', 'non-production');
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
                $fileName = "6s-ranking-non-production-" . $year . "-" . $month . ".xlsx";

                $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
                $sheet = $spreadsheet->getActiveSheet();
                $sheet->setTitle('6S Audit Non-Production');

                // Header title
                $sheet->setCellValue('A1', "Ranking 6S Audit Non-Production - $monthName $year");
                $sheet->mergeCells('A1:L1');
                $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14);
                $sheet->getStyle('A1')->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);

                // Table headers
                $headers = ["Rank", "Department", "Audit Date", "Auditor", "Lean Facilitator", "1S (Sort)", "2S (Set in Order)", "3S (Shine)", "4S (Standardize)", "5S (Sustain)", "6S (Safety)", "Final Score"];
                $col = 'A';
                foreach ($headers as $headerText) {
                    $sheet->setCellValue($col . '3', $headerText);
                    $col++;
                }

                // Header styling
                $headerStyle = [
                    'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                    'fill' => ['fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID, 'startColor' => ['rgb' => '1F4E78']],
                    'alignment' => ['horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER]
                ];
                $sheet->getStyle('A3:L3')->applyFromArray($headerStyle);

                // Data rows
                $rowNum = 4;
                foreach ($formatted as $index => $audit) {
                    $finalScore = ($audit['sort_score'] + $audit['set_in_order_score'] + $audit['shine_score'] + $audit['standardize_score'] + $audit['sustain_score'] + $audit['safety_score']) / 6;
                    $formattedDate = !empty($audit['audit_date']) ? date('d F Y', strtotime($audit['audit_date'])) : '-';

                    $sheet->setCellValue('A' . $rowNum, $index + 1);
                    $sheet->setCellValue('B' . $rowNum, $audit['Department']['name']);
                    $sheet->setCellValue('C' . $rowNum, $formattedDate);
                    $sheet->setCellValue('D' . $rowNum, $audit['auditor_name'] ?? '-');
                    $sheet->setCellValue('E' . $rowNum, $audit['lean_facilitator_name'] ?? '-');
                    $sheet->setCellValue('F' . $rowNum, (float)($audit['sort_score'] ?? 0));
                    $sheet->setCellValue('G' . $rowNum, (float)($audit['set_in_order_score'] ?? 0));
                    $sheet->setCellValue('H' . $rowNum, (float)($audit['shine_score'] ?? 0));
                    $sheet->setCellValue('I' . $rowNum, (float)($audit['standardize_score'] ?? 0));
                    $sheet->setCellValue('J' . $rowNum, (float)($audit['sustain_score'] ?? 0));
                    $sheet->setCellValue('K' . $rowNum, (float)($audit['safety_score'] ?? 0));
                    $sheet->setCellValue('L' . $rowNum, (float)number_format($finalScore, 2));

                    $rowNum++;
                }

                // Auto size columns
                foreach (range('A', 'L') as $colLetter) {
                    $sheet->getColumnDimension($colLetter)->setAutoSize(true);
                }

                if (ob_get_level()) {
                    ob_end_clean();
                }

                header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                header('Content-Disposition: attachment;filename="' . $fileName . '"');
                header('Cache-Control: max-age=0');

                $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
                $writer->save('php://output');
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
            $builder = $this->model->db->table('NonProductionAudits a');
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

            $builder = $this->model->db->table('NonProductionAudits a');
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
     * Create non-production audit
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
     * Update non-production audit
     */
    public function updateAudit($id = null)
    {
        try {
            $audit = $this->model->find($id);
            if (!$audit) {
                return $this->response->setJSON(['message' => 'Audit not found'])->setStatusCode(404);
            }

            $post = $this->request->getPost();
            if (empty($post)) {
                $json = $this->request->getJSON(true);
                if (!empty($json)) {
                    $post = $json;
                } else {
                    $post = $this->request->getRawInput() ?: [];
                }
            }

            // Handle existing photos
            $existingPhotos = [];
            if (isset($post['existing_photos'])) {
                if (is_string($post['existing_photos'])) {
                    $existingPhotos = json_decode($post['existing_photos'], true) ?: [];
                } elseif (is_array($post['existing_photos'])) {
                    $existingPhotos = $post['existing_photos'];
                }
            } else {
                $existingPhotos = json_decode($audit['photo_url'] ?? '[]', true) ?: [];
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
     * Delete non-production audit
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
