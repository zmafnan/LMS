<?php

namespace Modules\Kanban\Controllers;

use App\Controllers\BaseController;
use Modules\Kanban\Services\KanbanService;
use Modules\Tasks\Services\TaskService;

class KanbanController extends BaseController
{
    protected $service;
    protected $taskService;

    public function __construct()
    {
        $this->service = new KanbanService();
        $this->taskService = new TaskService();
    }

    /**
     * Get grouped column board data
     */
    public function index()
    {
        $board = $this->service->getBoardData();
        return $this->response->setJSON($board);
    }

    /**
     * Move card to a different category
     */
    public function move()
    {
        $json = $this->request->getJSON(true);
        $taskId = $json['task_id'] ?? null;
        $targetCategoryId = $json['kanban_category_id'] ?? null;

        if (!$taskId || !$targetCategoryId) {
            return $this->response->setJSON([
                'error' => 'Bad Request', 
                'message' => 'Missing task_id or kanban_category_id.'
            ])->setStatusCode(400);
        }

        // Updating via TaskService ensures logs trigger
        if ($this->taskService->updateTask((int)$taskId, ['kanban_category_id' => (int)$targetCategoryId])) {
            return $this->response->setJSON([
                'success' => true, 
                'message' => 'Task moved successfully.'
            ]);
        }

        return $this->response->setJSON([
            'error' => 'Internal Server Error', 
            'message' => 'Failed to move task.'
        ])->setStatusCode(500);
    }
}
