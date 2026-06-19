<?php

namespace Modules\Tasks\Services;

use Modules\Tasks\Repositories\TaskRepository;
use App\Libraries\AuthService;

class TaskService
{
    protected $repository;

    public function __construct()
    {
        $this->repository = new TaskRepository();
    }

    public function getTasks(array $filters = [], int $limit = 50, int $offset = 0)
    {
        return $this->repository->getFilteredTasks($filters, $limit, $offset);
    }

    public function getTask(int $id)
    {
        return $this->repository->getTaskDetails($id);
    }

    public function createTask(array $data): int
    {
        $data['created_by'] = AuthService::id();
        $taskId = $this->repository->create($data);
        
        $this->repository->logActivity($taskId, AuthService::id(), 'created task', [
            'task_name' => $data['task_name']
        ]);

        return $taskId;
    }

    public function updateTask(int $id, array $data): bool
    {
        $oldTask = $this->repository->getTaskDetails($id);
        if (!$oldTask) {
            return false;
        }

        $success = $this->repository->update($id, $data);
        if ($success) {
            $changes = [];
            
            // Progress Logging
            if (isset($data['progress']) && (int)$data['progress'] !== (int)$oldTask['progress']) {
                $changes['progress'] = [
                    'from' => (int)$oldTask['progress'],
                    'to'   => (int)$data['progress']
                ];
                $this->repository->logActivity($id, AuthService::id(), 'changed progress', $changes['progress']);
            }

            // Category Logging
            if (isset($data['kanban_category_id']) && (int)$data['kanban_category_id'] !== (int)$oldTask['kanban_category_id']) {
                $changes['category'] = [
                    'from' => (int)$oldTask['kanban_category_id'],
                    'to'   => (int)$data['kanban_category_id']
                ];
                $this->repository->logActivity($id, AuthService::id(), 'changed category', $changes['category']);
            }

            // Status Logging
            if (isset($data['status']) && $data['status'] !== $oldTask['status']) {
                $changes['status'] = [
                    'from' => $oldTask['status'],
                    'to'   => $data['status']
                ];
                $this->repository->logActivity($id, AuthService::id(), 'changed status', $changes['status']);
            }

            // Due Date Logging
            if (isset($data['due_date']) && $data['due_date'] !== $oldTask['due_date']) {
                $changes['due_date'] = [
                    'from' => $oldTask['due_date'],
                    'to'   => $data['due_date']
                ];
                $this->repository->logActivity($id, AuthService::id(), 'updated due date', $changes['due_date']);
            }

            if (empty($changes)) {
                $this->repository->logActivity($id, AuthService::id(), 'updated task details');
            }
        }

        return $success;
    }

    public function deleteTask(int $id): bool
    {
        return $this->repository->delete($id);
    }

    /**
     * File Upload Handler
     */
    public function uploadAttachment(int $taskId, $file): ?array
    {
        if ($file->isValid() && !$file->hasMoved()) {
            $uploadDir = FCPATH . 'uploads/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }

            $newName = $file->getRandomName();
            $file->move($uploadDir, $newName);

            $attachmentData = [
                'task_id'     => $taskId,
                'file_name'   => $file->getClientName(),
                'file_path'   => 'uploads/' . $newName,
                'file_type'   => $file->getClientMimeType(),
                'file_size'   => $file->getSize(),
                'uploaded_by' => AuthService::id(),
                'created_at'  => date('Y-m-d H:i:s')
            ];

            $attachmentId = $this->repository->addAttachment($attachmentData);
            $attachmentData['id'] = $attachmentId;
            
            $this->repository->logActivity($taskId, AuthService::id(), 'uploaded attachment', [
                'file_name' => $file->getClientName()
            ]);

            return $attachmentData;
        }

        return null;
    }

    /**
     * File Deletion Handler
     */
    public function deleteAttachment(int $id): bool
    {
        $attachment = $this->repository->getAttachment($id);
        if (!$attachment) {
            return false;
        }

        $physicalPath = FCPATH . $attachment['file_path'];
        if (file_exists($physicalPath)) {
            unlink($physicalPath);
        }

        $success = $this->repository->deleteAttachment($id);
        if ($success) {
            $this->repository->logActivity($attachment['task_id'], AuthService::id(), 'deleted attachment', [
                'file_name' => $attachment['file_name']
            ]);
        }

        return $success;
    }
}
