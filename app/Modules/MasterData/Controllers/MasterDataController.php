<?php

namespace Modules\MasterData\Controllers;

use App\Controllers\BaseController;
use Modules\MasterData\Services\MasterDataService;
use App\Libraries\AuthService;

class MasterDataController extends BaseController
{
    protected $service;

    public function __construct()
    {
        $this->service = new MasterDataService();
    }

    // --- PRIORITIES ---
    
    public function getPriorities()
    {
        return $this->response->setJSON($this->service->getPriorities());
    }

    public function storePriority()
    {
        if (!AuthService::checkRole(['admin', 'leader'])) {
            return $this->response->setJSON(['error' => 'Forbidden', 'message' => 'Unauthorized operation.'])->setStatusCode(403);
        }
        $json = $this->request->getJSON(true);
        if (empty($json['name']) || empty($json['color']) || !isset($json['level'])) {
            return $this->response->setJSON(['error' => 'Bad Request', 'message' => 'Missing fields.'])->setStatusCode(400);
        }
        $this->service->createPriority($json);
        return $this->response->setJSON(['success' => true, 'message' => 'Priority created successfully.']);
    }

    public function updatePriority($id = null)
    {
        if (!AuthService::checkRole(['admin', 'leader'])) {
            return $this->response->setJSON(['error' => 'Forbidden', 'message' => 'Unauthorized operation.'])->setStatusCode(403);
        }
        $json = $this->request->getJSON(true);
        $this->service->updatePriority((int)$id, $json);
        return $this->response->setJSON(['success' => true, 'message' => 'Priority updated successfully.']);
    }

    public function deletePriority($id = null)
    {
        if (!AuthService::checkRole(['admin', 'leader'])) {
            return $this->response->setJSON(['error' => 'Forbidden', 'message' => 'Unauthorized operation.'])->setStatusCode(403);
        }
        $this->service->deletePriority((int)$id);
        return $this->response->setJSON(['success' => true, 'message' => 'Priority deleted successfully.']);
    }

    // --- KANBAN CATEGORIES ---

    public function getCategories()
    {
        return $this->response->setJSON($this->service->getCategories());
    }

    public function storeCategory()
    {
        if (!AuthService::checkRole(['admin', 'leader'])) {
            return $this->response->setJSON(['error' => 'Forbidden', 'message' => 'Unauthorized operation.'])->setStatusCode(403);
        }
        $json = $this->request->getJSON(true);
        if (empty($json['name']) || empty($json['color'])) {
            return $this->response->setJSON(['error' => 'Bad Request', 'message' => 'Missing fields.'])->setStatusCode(400);
        }
        $this->service->createCategory($json);
        return $this->response->setJSON(['success' => true, 'message' => 'Category created successfully.']);
    }

    public function updateCategory($id = null)
    {
        if (!AuthService::checkRole(['admin', 'leader'])) {
            return $this->response->setJSON(['error' => 'Forbidden', 'message' => 'Unauthorized operation.'])->setStatusCode(403);
        }
        $json = $this->request->getJSON(true);
        $this->service->updateCategory((int)$id, $json);
        return $this->response->setJSON(['success' => true, 'message' => 'Category updated successfully.']);
    }

    public function deleteCategory($id = null)
    {
        if (!AuthService::checkRole(['admin', 'leader'])) {
            return $this->response->setJSON(['error' => 'Forbidden', 'message' => 'Unauthorized operation.'])->setStatusCode(403);
        }
        $this->service->deleteCategory((int)$id);
        return $this->response->setJSON(['success' => true, 'message' => 'Category deleted successfully.']);
    }
}
