<?php

namespace Modules\Tasks\Controllers;

use App\Controllers\BaseController;
use Modules\Tasks\Services\TaskService;
use App\Libraries\AuthService;

class TasksController extends BaseController
{
    protected $service;

    public function __construct()
    {
        $this->service = new TaskService();
    }

    /**
     * Retrieve tasks with filtering
     */
    public function index()
    {
        $filters = $this->request->getGet();
        $limit = $this->request->getGet('limit') ? (int)$this->request->getGet('limit') : 50;
        $offset = $this->request->getGet('offset') ? (int)$this->request->getGet('offset') : 0;
        
        $tasksData = $this->service->getTasks($filters, $limit, $offset);
        return $this->response->setJSON($tasksData);
    }

    /**
     * Show single task details
     */
    public function show($id = null)
    {
        $task = $this->service->getTask((int)$id);
        if (!$task) {
            return $this->response->setJSON([
                'error' => 'Not Found', 
                'message' => 'Task not found.'
            ])->setStatusCode(404);
        }
        return $this->response->setJSON($task);
    }

    /**
     * Store new task
     */
    public function store()
    {
        $json = $this->request->getJSON(true);
        if (empty($json['task_name'])) {
            return $this->response->setJSON([
                'error' => 'Bad Request', 
                'message' => 'Task name is required.'
            ])->setStatusCode(400);
        }

        $taskId = $this->service->createTask($json);
        return $this->response->setJSON([
            'success' => true,
            'message' => 'Task created successfully.',
            'task_id' => $taskId
        ])->setStatusCode(201);
    }

    /**
     * Update existing task attributes
     */
    public function update($id = null)
    {
        $json = $this->request->getJSON(true);
        if ($this->service->updateTask((int)$id, $json)) {
            return $this->response->setJSON([
                'success' => true, 
                'message' => 'Task updated successfully.'
            ]);
        }
        return $this->response->setJSON([
            'error' => 'Internal Server Error', 
            'message' => 'Failed to update task.'
        ])->setStatusCode(500);
    }

    /**
     * Delete task (cascade logs and attachments)
     */
    public function delete($id = null)
    {
        if ($this->service->deleteTask((int)$id)) {
            return $this->response->setJSON([
                'success' => true, 
                'message' => 'Task deleted successfully.'
            ]);
        }
        return $this->response->setJSON([
            'error' => 'Internal Server Error', 
            'message' => 'Failed to delete task.'
        ])->setStatusCode(500);
    }

    /**
     * Upload an attachment to a task
     */
    public function upload($id = null)
    {
        $file = $this->request->getFile('attachment');
        if (!$file) {
            return $this->response->setJSON([
                'error' => 'Bad Request', 
                'message' => 'No attachment file uploaded.'
            ])->setStatusCode(400);
        }

        $attachment = $this->service->uploadAttachment((int)$id, $file);
        if ($attachment) {
            return $this->response->setJSON([
                'success' => true,
                'message' => 'Attachment uploaded successfully.',
                'attachment' => $attachment
            ]);
        }

        return $this->response->setJSON([
            'error' => 'Internal Server Error', 
            'message' => 'Failed to upload attachment.'
        ])->setStatusCode(500);
    }

    /**
     * Remove an attachment record and physical file
     */
    public function deleteFile($id = null)
    {
        if ($this->service->deleteAttachment((int)$id)) {
            return $this->response->setJSON([
                'success' => true, 
                'message' => 'Attachment deleted successfully.'
            ]);
        }
        return $this->response->setJSON([
            'error' => 'Internal Server Error', 
            'message' => 'Failed to delete attachment.'
        ])->setStatusCode(500);
    }
}
