<?php

namespace Modules\Audit6S\Controllers;

use App\Controllers\BaseController;
use Modules\Audit6S\Models\DepartmentModel;

class DepartmentController extends BaseController
{
    protected $model;

    public function __construct()
    {
        $this->model = new DepartmentModel();
    }

    /**
     * Get all departments sorted by name A-Z
     */
    public function getAllDepartments()
    {
        try {
            $departments = $this->model->orderBy('name', 'ASC')->findAll();
            return $this->response->setJSON($departments);
        } catch (\Exception $e) {
            return $this->response->setJSON(['message' => $e->getMessage()])->setStatusCode(500);
        }
    }

    /**
     * Get department by ID
     */
    public function getDepartmentById($id = null)
    {
        try {
            $department = $this->model->find($id);
            if (!$department) {
                return $this->response->setJSON(['message' => 'Department not found'])->setStatusCode(404);
            }
            return $this->response->setJSON($department);
        } catch (\Exception $e) {
            return $this->response->setJSON(['message' => $e->getMessage()])->setStatusCode(500);
        }
    }

    /**
     * Create department
     */
    public function createDepartment()
    {
        try {
            $data = $this->request->getJSON(true);
            if (empty($data['name']) || empty($data['type'])) {
                return $this->response->setJSON(['message' => 'Name and type are required'])->setStatusCode(400);
            }

            $id = $this->model->insert($data);
            $created = $this->model->find($id);
            return $this->response->setJSON($created)->setStatusCode(201);
        } catch (\Exception $e) {
            return $this->response->setJSON(['message' => $e->getMessage()])->setStatusCode(400);
        }
    }

    /**
     * Update department
     */
    public function updateDepartment($id = null)
    {
        try {
            $department = $this->model->find($id);
            if (!$department) {
                return $this->response->setJSON(['message' => 'Department not found'])->setStatusCode(404);
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
     * Delete department
     */
    public function deleteDepartment($id = null)
    {
        try {
            $department = $this->model->find($id);
            if (!$department) {
                return $this->response->setJSON(['message' => 'Department not found'])->setStatusCode(404);
            }

            $this->model->delete($id);
            return $this->response->setJSON(['message' => 'Department deleted successfully']);
        } catch (\Exception $e) {
            return $this->response->setJSON(['message' => $e->getMessage()])->setStatusCode(500);
        }
    }
}
