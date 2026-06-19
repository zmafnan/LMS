<?php

namespace Modules\MultiSkill\Controllers;

use App\Controllers\BaseController;
use Modules\MultiSkill\Services\MultiSkillService;
use App\Libraries\AuthService;

class MultiSkillController extends BaseController
{
    protected $service;

    public function __construct()
    {
        $this->service = new MultiSkillService();
    }

    /**
     * Get paginated employees list with filtering
     */
    public function getEmployees()
    {
        $filters = $this->request->getGet();
        $limit = $this->request->getGet('limit') ? (int)$this->request->getGet('limit') : 50;
        $offset = $this->request->getGet('offset') ? (int)$this->request->getGet('offset') : 0;

        $data = $this->service->getEmployees($filters, $limit, $offset);
        return $this->response->setJSON($data);
    }

    /**
     * Create a single employee record
     */
    public function createEmployee()
    {
        $json = $this->request->getJSON(true);
        if (empty($json['nik']) || empty($json['employee_name'])) {
            return $this->response->setJSON([
                'error' => 'Bad Request',
                'message' => 'NIK and Employee Name are required.'
            ])->setStatusCode(400);
        }

        $id = $this->service->createEmployee($json);
        return $this->response->setJSON([
            'success' => true,
            'message' => 'Employee created successfully.',
            'id' => $id
        ])->setStatusCode(201);
    }

    /**
     * Update employee record
     */
    public function updateEmployee($id = null)
    {
        $json = $this->request->getJSON(true);
        if (empty($json['nik']) || empty($json['employee_name'])) {
            return $this->response->setJSON([
                'error' => 'Bad Request',
                'message' => 'NIK and Employee Name are required.'
            ])->setStatusCode(400);
        }

        if ($this->service->updateEmployee((int)$id, $json)) {
            return $this->response->setJSON([
                'success' => true,
                'message' => 'Employee updated successfully.'
            ]);
        }

        return $this->response->setJSON([
            'error' => 'Internal Server Error',
            'message' => 'Failed to update employee.'
        ])->setStatusCode(500);
    }

    /**
     * Delete employee record
     */
    public function deleteEmployee($id = null)
    {
        if ($this->service->deleteEmployee((int)$id)) {
            return $this->response->setJSON([
                'success' => true,
                'message' => 'Employee deleted successfully.'
            ]);
        }

        return $this->response->setJSON([
            'error' => 'Internal Server Error',
            'message' => 'Failed to delete employee.'
        ])->setStatusCode(500);
    }

    /**
     * Bulk import employees from array
     */
    public function bulkImportEmployees()
    {
        $json = $this->request->getJSON(true);
        if (!is_array($json)) {
            return $this->response->setJSON([
                'error' => 'Bad Request',
                'message' => 'Expected JSON array of employees.'
            ])->setStatusCode(400);
        }

        $result = $this->service->bulkImportEmployees($json);
        return $this->response->setJSON($result);
    }

    /**
     * Get analytics charts data
     */
    public function getAnalytics()
    {
        $data = $this->service->getAnalytics();
        return $this->response->setJSON($data);
    }

    /**
     * Get reports data (unpaginated, filtered list)
     */
    public function getReports()
    {
        $filters = $this->request->getGet();
        // Set very high limit for complete reporting output
        $data = $this->service->getEmployees($filters, 10000, 0);
        return $this->response->setJSON($data);
    }
}
