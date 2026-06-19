<?php

namespace Modules\Reports\Services;

use Config\Database;

class ReportsService
{
    protected $db;

    public function __construct()
    {
        $this->db = Database::connect();
    }

    /**
     * Builds and queries tasks lists based on search, due dates, categories, and PIC filters.
     */
    public function generateReport(array $filters): array
    {
        $builder = $this->db->table('tasks t')
            ->select('t.*, p.name as priority_name, p.color as priority_color, kc.name as category_name, kc.color as category_color, u.username as assigned_username, uc.username as creator_username')
            ->join('priorities p', 'p.id = t.priority_id', 'left')
            ->join('kanban_categories kc', 'kc.id = t.kanban_category_id', 'left')
            ->join('users u', 'u.id = t.assigned_to', 'left')
            ->join('users uc', 'uc.id = t.created_by', 'left');

        // Apply filters
        if (!empty($filters['assigned_to'])) {
            $builder->where('t.assigned_to', (int)$filters['assigned_to']);
        }

        if (!empty($filters['kanban_category_id'])) {
            $builder->where('t.kanban_category_id', (int)$filters['kanban_category_id']);
        }

        if (!empty($filters['start_date'])) {
            $builder->where('t.start_date >=', $filters['start_date']);
        }

        if (!empty($filters['due_date'])) {
            $builder->where('t.due_date <=', $filters['due_date']);
        }

        if (!empty($filters['search'])) {
            $builder->groupStart()
                ->like('t.task_name', $filters['search'])
                ->orLike('t.improvement_category', $filters['search'])
                ->groupEnd();
        }

        return $builder->orderBy('t.created_at', 'DESC')->get()->getResultArray();
    }
}
