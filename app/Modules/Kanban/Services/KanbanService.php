<?php

namespace Modules\Kanban\Services;

use Modules\Kanban\Repositories\KanbanRepository;
use Modules\Tasks\Repositories\TaskRepository;

class KanbanService
{
    protected $kanbanRepo;
    protected $taskRepo;

    public function __construct()
    {
        $this->kanbanRepo = new KanbanRepository();
        $this->taskRepo = new TaskRepository();
    }

    /**
     * Group tasks under their respective Kanban columns
     */
    public function getBoardData(): array
    {
        // 1. Fetch categories
        $categories = $this->kanbanRepo->getAll();
        
        // 2. Fetch all active tasks
        $tasksData = $this->taskRepo->getFilteredTasks([], 1000, 0);
        $tasks = $tasksData['data'];

        // Group tasks by category ID
        $groupedTasks = [];
        foreach ($tasks as $task) {
            $catId = $task['kanban_category_id'] ?: 0;
            $groupedTasks[$catId][] = $task;
        }

        // 3. Assemble board columns
        $board = [];
        foreach ($categories as $cat) {
            $catId = (int)$cat['id'];
            $board[] = [
                'id'        => $catId,
                'name'      => $cat['name'],
                'color'     => $cat['color'],
                'wip_limit' => (int)$cat['wip_limit'],
                'tasks'     => $groupedTasks[$catId] ?? []
            ];
        }

        return $board;
    }
}
