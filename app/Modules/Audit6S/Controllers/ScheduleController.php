<?php

namespace Modules\Audit6S\Controllers;

use App\Controllers\BaseController;
use Modules\Audit6S\Models\AuditScheduleModel;
use Modules\Audit6S\Models\DepartmentModel;

class ScheduleController extends BaseController
{
    protected $model;

    public function __construct()
    {
        $this->model = new AuditScheduleModel();
    }

    /**
     * Get all schedules with filtering and nested Department objects
     */
    public function getAllSchedules()
    {
        try {
            $month = $this->request->getGet('month');
            $year = $this->request->getGet('year');
            $department_type = $this->request->getGet('department_type');
            $status = $this->request->getGet('status');

            $builder = $this->model->db->table('AuditSchedules s');
            $builder->select('s.*, d.name as department_name, d.type as department_type');
            $builder->join('Departments d', 'd.id = s.department_id');

            if ($month && $year) {
                $monthStr = str_pad($month, 2, '0', STR_PAD_LEFT);
                $startDate = "{$year}-{$monthStr}-01 00:00:00";
                $endDate = date('Y-m-t 23:59:59', strtotime($startDate));
                $builder->where('s.audit_date >=', $startDate);
                $builder->where('s.audit_date <=', $endDate);
            }

            if ($status) {
                $builder->where('s.status', $status);
            } else {
                $builder->whereIn('s.status', ['pending', 'completed']);
            }

            if ($department_type) {
                $builder->where('d.type', $department_type);
            }

            $builder->orderBy('d.name', 'ASC');
            $builder->orderBy('s.audit_date', 'ASC');

            $schedules = $builder->get()->getResultArray();

            $formatted = [];
            foreach ($schedules as $row) {
                $formatted[] = [
                    'id' => (int)$row['id'],
                    'department_id' => (int)$row['department_id'],
                    'audit_date' => $row['audit_date'],
                    'lean_facilitator_name' => $row['lean_facilitator_name'],
                    'auditor_name' => $row['auditor_name'],
                    'status' => $row['status'],
                    'createdAt' => $row['createdAt'],
                    'updatedAt' => $row['updatedAt'],
                    'Department' => [
                        'id' => (int)$row['department_id'],
                        'name' => $row['department_name'],
                        'type' => $row['department_type']
                    ]
                ];
            }

            return $this->response->setJSON($formatted);
        } catch (\Exception $e) {
            return $this->response->setJSON([
                'message' => 'Error fetching schedules',
                'error' => $e->getMessage()
            ])->setStatusCode(500);
        }
    }

    /**
     * Get schedule by ID
     */
    public function getScheduleById($id = null)
    {
        try {
            $builder = $this->model->db->table('AuditSchedules s');
            $builder->select('s.*, d.name as department_name, d.type as department_type');
            $builder->join('Departments d', 'd.id = s.department_id');
            $builder->where('s.id', $id);
            $row = $builder->get()->getRowArray();

            if (!$row) {
                return $this->response->setJSON(['message' => 'Schedule not found'])->setStatusCode(404);
            }

            $formatted = [
                'id' => (int)$row['id'],
                'department_id' => (int)$row['department_id'],
                'audit_date' => $row['audit_date'],
                'lean_facilitator_name' => $row['lean_facilitator_name'],
                'auditor_name' => $row['auditor_name'],
                'status' => $row['status'],
                'createdAt' => $row['createdAt'],
                'updatedAt' => $row['updatedAt'],
                'Department' => [
                    'id' => (int)$row['department_id'],
                    'name' => $row['department_name'],
                    'type' => $row['department_type']
                ]
            ];

            return $this->response->setJSON($formatted);
        } catch (\Exception $e) {
            return $this->response->setJSON(['message' => $e->getMessage()])->setStatusCode(500);
        }
    }

    /**
     * Create schedule
     */
    public function createSchedule()
    {
        try {
            $data = $this->request->getJSON(true);
            if (empty($data['department_id']) || empty($data['audit_date'])) {
                return $this->response->setJSON(['message' => 'Department ID and Audit Date are required'])->setStatusCode(400);
            }

            $id = $this->model->insert($data);
            $created = $this->model->find($id);
            return $this->response->setJSON($created)->setStatusCode(201);
        } catch (\Exception $e) {
            return $this->response->setJSON(['message' => $e->getMessage()])->setStatusCode(400);
        }
    }

    /**
     * Update schedule
     */
    public function updateSchedule($id = null)
    {
        try {
            $schedule = $this->model->find($id);
            if (!$schedule) {
                return $this->response->setJSON(['message' => 'Schedule not found'])->setStatusCode(404);
            }

            $data = $this->request->getJSON(true);
            $this->model->update($id, $data);
            $updated = $this->model->find($id);
            return $this->response->setJSON($updated);
        } catch (\Exception $e) {
            return $this->response->setJSON(['message' => $e->getMessage()])->setStatusCode(400);
        }
    }

    /**
     * Delete schedule
     */
    public function deleteSchedule($id = null)
    {
        try {
            $schedule = $this->model->find($id);
            if (!$schedule) {
                return $this->response->setJSON(['message' => 'Schedule not found'])->setStatusCode(404);
            }

            $this->model->delete($id);
            return $this->response->setJSON(['message' => 'Schedule deleted successfully']);
        } catch (\Exception $e) {
            return $this->response->setJSON(['message' => $e->getMessage()])->setStatusCode(500);
        }
    }

    /**
     * Create monthly schedules for all departments
     */
    public function createMonthlySchedules()
    {
        try {
            $data = $this->request->getJSON(true);
            $month = $data['month'] ?? null;
            $year = $data['year'] ?? null;
            $defaultAuditor = $data['defaultAuditor'] ?? '';
            $defaultFacilitator = $data['defaultFacilitator'] ?? '';

            if (!$month || !$year) {
                return $this->response->setJSON(['message' => 'Month and year are required'])->setStatusCode(400);
            }

            $deptModel = new DepartmentModel();
            $departments = $deptModel->findAll();

            // Create a date object for the 15th of the month
            $scheduleDate = date('Y-m-d', strtotime("$year-$month-15"));
            $createdSchedules = [];

            foreach ($departments as $dept) {
                $scheduleData = [
                    'department_id' => $dept['id'],
                    'audit_date' => $scheduleDate,
                    'auditor_name' => $defaultAuditor,
                    'lean_facilitator_name' => $defaultFacilitator,
                    'status' => 'pending'
                ];

                $id = $this->model->insert($scheduleData);
                $scheduleData['id'] = $id;
                $createdSchedules[] = $scheduleData;
            }

            return $this->response->setJSON([
                'message' => "Created " . count($createdSchedules) . " schedules for $month/$year",
                'count' => count($createdSchedules),
                'schedules' => $createdSchedules
            ])->setStatusCode(201);
        } catch (\Exception $e) {
            return $this->response->setJSON([
                'message' => 'Error creating monthly schedules',
                'error' => $e->getMessage()
            ])->setStatusCode(500);
        }
    }

    /**
     * Export schedules to CSV
     */
    public function exportToExcel()
    {
        try {
            $month = $this->request->getGet('month');
            $year = $this->request->getGet('year');
            $department_type = $this->request->getGet('department_type');
            $status = $this->request->getGet('status');

            $builder = $this->model->db->table('AuditSchedules s');
            $builder->select('s.*, d.name as department_name, d.type as department_type');
            $builder->join('Departments d', 'd.id = s.department_id');

            if ($month && $year) {
                $monthStr = str_pad($month, 2, '0', STR_PAD_LEFT);
                $startDate = "{$year}-{$monthStr}-01 00:00:00";
                $endDate = date('Y-m-t 23:59:59', strtotime($startDate));
                $builder->where('s.audit_date >=', $startDate);
                $builder->where('s.audit_date <=', $endDate);
            }

            if ($status) {
                $builder->where('s.status', $status);
            }

            if ($department_type) {
                $builder->where('d.type', $department_type);
            }

            $builder->orderBy('d.name', 'ASC');
            $builder->orderBy('s.audit_date', 'ASC');

            $schedules = $builder->get()->getResultArray();

            $monthName = $month ? date("F", mktime(0, 0, 0, $month, 10)) : "All";
            $fileName = "Audit_Schedule_" . $monthName . "_" . ($year ?? "All") . ".xlsx";

            $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
            $sheet = $spreadsheet->getActiveSheet();
            $sheet->setTitle('Audit Schedule');

            // Header title
            $sheet->setCellValue('A1', "AUDIT SCHEDULE - $monthName " . ($year ?? "All"));
            $sheet->mergeCells('A1:G1');
            $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14);
            $sheet->getStyle('A1')->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);

            // Table headers
            $headers = ["No", "Department", "Department Type", "Audit Date", "Auditor", "Lean Facilitator", "Status"];
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
            $sheet->getStyle('A3:G3')->applyFromArray($headerStyle);

            // Data rows
            $rowNum = 4;
            foreach ($schedules as $index => $schedule) {
                $formattedDate = date('d F Y', strtotime($schedule['audit_date']));
                $sheet->setCellValue('A' . $rowNum, $index + 1);
                $sheet->setCellValue('B' . $rowNum, $schedule['department_name']);
                $sheet->setCellValue('C' . $rowNum, ucfirst($schedule['department_type'] ?? ''));
                $sheet->setCellValue('D' . $rowNum, $formattedDate);
                $sheet->setCellValue('E' . $rowNum, $schedule['auditor_name']);
                $sheet->setCellValue('F' . $rowNum, $schedule['lean_facilitator_name']);
                $sheet->setCellValue('G' . $rowNum, ucfirst($schedule['status'] ?? ''));

                $rowNum++;
            }

            // Auto size columns
            foreach (range('A', 'G') as $colLetter) {
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
        } catch (\Exception $e) {
            return $this->response->setJSON([
                'message' => 'Error exporting schedules',
                'error' => $e->getMessage()
            ])->setStatusCode(500);
        }
    }
}
