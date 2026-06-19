<?php

namespace Modules\Tasks\Models;

use CodeIgniter\Model;

class TaskModel extends Model
{
    protected $table = 'tasks';
    protected $primaryKey = 'id';
    protected $allowedFields = [
        'task_name', 'description', 'priority_id', 'kanban_category_id', 'status', 'assigned_to',
        'start_date', 'due_date', 'progress', 'notes', 'root_cause', 'improvement_category',
        'benefit', 'saving_cost', 'created_by', 'created_at', 'updated_at'
    ];
    protected $useTimestamps = true;
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';
}
