<?php

namespace Modules\Dashboard\Services;

use Config\Database;

class DashboardService
{
    protected $db;

    public function __construct()
    {
        $this->db = Database::connect();
    }

    /**
     * Gathers all dynamic data arrays needed for the dashboard widgets
     */
    public function getDashboardMetrics(): array
    {
        $today = date('Y-m-d');
        
        // 1. Task Counts
        $totalTasks = $this->db->table('tasks')->countAllResults();
        
        $activeCount = $this->db->table('tasks')
            ->where('status !=', 'Done')
            ->countAllResults();

        $completedTasks = $this->db->table('tasks')
            ->where('status', 'Done')
            ->countAllResults();

        $overdueCount = $this->db->table('tasks')
            ->where('status !=', 'Done')
            ->where('due_date <', $today)
            ->countAllResults();

        // 2. Tasks by Priority
        $priorities = $this->db->table('priorities')->get()->getResultArray();
        $tasksByPriority = [];
        foreach ($priorities as $p) {
            $count = $this->db->table('tasks')->where('priority_id', $p['id'])->countAllResults();
            $tasksByPriority[] = [
                'name'  => $p['name'],
                'value' => $count,
                'color' => $p['color']
            ];
        }

        // 3. Tasks by Kanban Category (which represents Task Methodology Categories)
        $categories = $this->db->table('kanban_categories')->orderBy('id', 'ASC')->get()->getResultArray();
        $tasksByCategory = [];
        foreach ($categories as $c) {
            $count = $this->db->table('tasks')->where('kanban_category_id', $c['id'])->countAllResults();
            $tasksByCategory[] = [
                'name'  => $c['name'],
                'value' => $count,
                'color' => $c['color']
            ];
        }

        // 5. Recent Activities
        $activities = $this->db->table('task_logs tl')
            ->select('tl.*, t.task_name, u.username')
            ->join('tasks t', 't.id = tl.task_id', 'left')
            ->join('users u', 'u.id = tl.user_id', 'left')
            ->orderBy('tl.created_at', 'DESC')
            ->limit(10)
            ->get()
            ->getResultArray();

        // 6. Upcoming due tasks (next 5)
        $upcoming = $this->db->table('tasks t')
            ->select('t.id, t.task_name, t.due_date, p.name as priority_name, p.color as priority_color, u.username as assigned_username')
            ->join('priorities p', 'p.id = t.priority_id', 'left')
            ->join('users u', 'u.id = t.assigned_to', 'left')
            ->where('t.due_date >=', $today)
            ->where('t.status !=', 'Done');
        $upcomingList = $upcoming->orderBy('t.due_date', 'ASC')->limit(5)->get()->getResultArray();

        // 7. Tasks by Status
        $statuses = ['Backlog', 'To Do', 'In Progress', 'Pending', 'Review', 'Done'];
        $statusColors = [
            'Backlog'     => '#868e96',
            'To Do'       => '#228be6',
            'In Progress' => '#fab005',
            'Pending'     => '#fd7e14', // orange
            'Review'      => '#7950f2',
            'Done'        => '#40c057',
        ];
        $tasksByStatus = [];
        foreach ($statuses as $status) {
            $count = $this->db->table('tasks')->where('status', $status)->countAllResults();
            $tasksByStatus[] = [
                'name'  => $status,
                'value' => $count,
                'color' => $statusColors[$status]
            ];
        }

        // 8. Tasks by PIC (Bar Chart)
        $rawPics = $this->db->table('tasks t')
            ->select("COALESCE(u.username, 'Unassigned') as name, COUNT(t.id) as value")
            ->join('users u', 'u.id = t.assigned_to', 'left')
            ->groupBy(['u.username', 't.assigned_to'])
            ->orderBy('value', 'DESC')
            ->get()
            ->getResultArray();

        $tasksByPic = [];
        foreach ($rawPics as $p) {
            $tasksByPic[] = [
                'name'  => $p['name'],
                'value' => (int)$p['value']
            ];
        }

        return [
            'metrics' => [
                'totalTasks'     => $totalTasks,
                'activeTasks'    => $activeCount,
                'completedTasks' => $completedTasks,
                'overdueTasks'   => $overdueCount
            ],
            'tasksByPriority' => $tasksByPriority,
            'tasksByCategory' => $tasksByCategory,
            'tasksByStatus'   => $tasksByStatus,
            'tasksByPic'      => $tasksByPic,
            'activities'      => $activities,
            'upcoming'        => $upcomingList
        ];
    }
}
