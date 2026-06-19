<?php

namespace Modules\Tasks\Repositories;

use Modules\Tasks\Models\TaskModel;
use Modules\Tasks\Models\AttachmentModel;
use Config\Database;

class TaskRepository
{
    protected $taskModel;
    protected $attachmentModel;
    protected $db;

    public function __construct()
    {
        $this->taskModel = new TaskModel();
        $this->attachmentModel = new AttachmentModel();
        $this->db = Database::connect();
    }

    /**
     * Fetch tasks with filters, joins, pagination and sorting.
     */
    public function getFilteredTasks(array $filters = [], int $limit = 50, int $offset = 0)
    {
        $builder = $this->db->table('tasks t')
            ->select('t.*, p.name as priority_name, p.color as priority_color, kc.name as category_name, kc.color as category_color, u.username as assigned_username, uc.username as creator_username')
            ->join('priorities p', 'p.id = t.priority_id', 'left')
            ->join('kanban_categories kc', 'kc.id = t.kanban_category_id', 'left')
            ->join('users u', 'u.id = t.assigned_to', 'left')
            ->join('users uc', 'uc.id = t.created_by', 'left');

        if (!empty($filters['search'])) {
            $builder->groupStart()
                ->like('t.task_name', $filters['search'])
                ->orLike('t.description', $filters['search'])
                ->orLike('t.improvement_category', $filters['search'])
                ->groupEnd();
        }

        if (!empty($filters['priority_id'])) {
            $builder->where('t.priority_id', $filters['priority_id']);
        }

        if (!empty($filters['kanban_category_id'])) {
            $builder->where('t.kanban_category_id', $filters['kanban_category_id']);
        }

        if (!empty($filters['status'])) {
            $builder->where('t.status', $filters['status']);
        }

        if (!empty($filters['assigned_to'])) {
            $builder->where('t.assigned_to', $filters['assigned_to']);
        }

        if (!empty($filters['start_date']) && !empty($filters['due_date'])) {
            $builder->where('t.start_date >=', $filters['start_date'])
                    ->where('t.due_date <=', $filters['due_date']);
        }

        // Sorting configuration
        $sortBy = $filters['sort_by'] ?? 't.created_at';
        $sortOrder = $filters['sort_order'] ?? 'DESC';
        
        // Sanitize sorting field to avoid SQL injection
        $allowedSort = ['t.created_at', 't.task_name', 't.due_date', 'p.level', 't.progress', 't.saving_cost'];
        if (!in_array($sortBy, $allowedSort)) {
            $sortBy = 't.created_at';
        }
        $sortOrder = strtoupper($sortOrder) === 'ASC' ? 'ASC' : 'DESC';
        
        $builder->orderBy($sortBy, $sortOrder);

        // Cloning to preserve query states for count
        $tempBuilder = clone $builder;
        $total = $tempBuilder->countAllResults(false);

        $results = $builder->limit($limit, $offset)->get()->getResultArray();

        return [
            'data'  => $results,
            'total' => $total
        ];
    }

    /**
     * Get detailed task record with nested attachments and logs
     */
    public function getTaskDetails(int $id)
    {
        $task = $this->db->table('tasks t')
            ->select('t.*, p.name as priority_name, p.color as priority_color, kc.name as category_name, kc.color as category_color, u.username as assigned_username, uc.username as creator_username')
            ->join('priorities p', 'p.id = t.priority_id', 'left')
            ->join('kanban_categories kc', 'kc.id = t.kanban_category_id', 'left')
            ->join('users u', 'u.id = t.assigned_to', 'left')
            ->join('users uc', 'uc.id = t.created_by', 'left')
            ->where('t.id', $id)
            ->get()
            ->getRowArray();

        if (!$task) {
            return null;
        }

        // Attachments
        $task['attachments'] = $this->db->table('attachments a')
            ->select('a.*, u.username as uploader_username')
            ->join('users u', 'u.id = a.uploaded_by', 'left')
            ->where('a.task_id', $id)
            ->get()
            ->getResultArray();

        // Logs
        $task['logs'] = $this->db->table('task_logs tl')
            ->select('tl.*, u.username as user_username')
            ->join('users u', 'u.id = tl.user_id', 'left')
            ->where('tl.task_id', $id)
            ->orderBy('tl.created_at', 'DESC')
            ->get()
            ->getResultArray();

        return $task;
    }

    public function create(array $data)
    {
        $this->taskModel->insert($data);
        return $this->taskModel->insertID();
    }

    public function update(int $id, array $data)
    {
        return $this->taskModel->update($id, $data);
    }

    public function delete(int $id)
    {
        return $this->taskModel->delete($id);
    }

    // Attachments
    public function addAttachment(array $data)
    {
        return $this->attachmentModel->insert($data);
    }

    public function getAttachment(int $id)
    {
        return $this->attachmentModel->find($id);
    }

    public function deleteAttachment(int $id)
    {
        return $this->attachmentModel->delete($id);
    }

    // Logging activity
    public function logActivity(int $taskId, ?int $userId, string $activity, array $details = [])
    {
        $this->db->table('task_logs')->insert([
            'task_id'    => $taskId,
            'user_id'    => $userId,
            'activity'   => $activity,
            'details'    => json_encode($details),
            'created_at' => date('Y-m-d H:i:s')
        ]);
    }
}
