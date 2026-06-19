<?php

namespace Modules\MultiSkill\Services;

use Modules\MultiSkill\Repositories\LeanEmployeeRepository;

class LeanMultiSkillService
{
    protected $repository;

    public function __construct()
    {
        $this->repository = new LeanEmployeeRepository();
    }

    public function getEmployees(array $filters = [], int $limit = 50, int $offset = 0)
    {
        return $this->repository->getFilteredEmployees($filters, $limit, $offset);
    }

    public function getEmployee(int $id)
    {
        return $this->repository->find($id);
    }

    public function createEmployee(array $data)
    {
        return $this->repository->create($data);
    }

    public function updateEmployee(int $id, array $data)
    {
        return $this->repository->update($id, $data);
    }

    public function deleteEmployee(int $id)
    {
        return $this->repository->delete($id);
    }

    public function getAnalytics()
    {
        return $this->repository->getAnalyticsMetrics();
    }

    /**
     * Parse and upsert a list of lean employees for bulk import
     */
    public function bulkImportEmployees(array $rows)
    {
        $inserted = 0;
        $updated = 0;
        $errors = [];

        foreach ($rows as $index => $row) {
            // Basic validation
            $nik = isset($row['nik']) ? trim((string)$row['nik']) : '';
            $name = isset($row['employee_name']) ? trim((string)$row['employee_name']) : '';

            if (empty($nik)) {
                $errors[] = "Row " . ($index + 1) . ": NIK is required.";
                continue;
            }
            if (empty($name)) {
                $errors[] = "Row " . ($index + 1) . ": Employee Name is required.";
                continue;
            }

            // Prepare record
            $data = [
                'nik'           => $nik,
                'employee_name' => $name,
                'position'      => $row['position'] ?? 'CI Specialist',
                'section'       => $row['section'] ?? '',
                'line'          => $row['line'] ?? '',
                'skill_1'       => $row['skill_1'] ?? '',
                'skill_1_grade' => $row['skill_1_grade'] ?? '',
                'skill_2'       => $row['skill_2'] ?? '',
                'skill_2_grade' => $row['skill_2_grade'] ?? '',
                'skill_3'       => $row['skill_3'] ?? '',
                'skill_3_grade' => $row['skill_3_grade'] ?? '',
                'skill_4'       => $row['skill_4'] ?? '',
                'skill_4_grade' => $row['skill_4_grade'] ?? '',
                'skill_5'       => $row['skill_5'] ?? '',
                'skill_5_grade' => $row['skill_5_grade'] ?? '',
                'skill_6'       => $row['skill_6'] ?? '',
                'skill_6_grade' => $row['skill_6_grade'] ?? '',
                'skill_7'       => $row['skill_7'] ?? '',
                'skill_7_grade' => $row['skill_7_grade'] ?? '',
                'skill_8'       => $row['skill_8'] ?? '',
                'skill_8_grade' => $row['skill_8_grade'] ?? '',
                'skill_9'       => $row['skill_9'] ?? '',
                'skill_9_grade' => $row['skill_9_grade'] ?? '',
                'skill_10'      => $row['skill_10'] ?? '',
                'skill_10_grade'=> $row['skill_10_grade'] ?? '',
                'join_date'     => !empty($row['join_date']) ? $row['join_date'] : date('Y-m-d'),
                'status'        => $row['status'] ?? 'Active',
            ];

            // Clean date format if needed
            if (is_numeric($data['join_date'])) {
                $data['join_date'] = date('Y-m-d', ($data['join_date'] - 25569) * 86400);
            }

            $existing = $this->repository->findByNik($nik);
            if ($existing) {
                $this->repository->update((int)$existing['id'], $data);
                $updated++;
            } else {
                $this->repository->create($data);
                $inserted++;
            }
        }

        return [
            'success'  => true,
            'inserted' => $inserted,
            'updated'  => $updated,
            'errors'   => $errors
        ];
    }
}
