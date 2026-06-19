<?php

namespace Modules\MasterData\Services;

use Modules\MasterData\Repositories\PriorityRepository;
use Modules\Kanban\Repositories\KanbanRepository;

class MasterDataService
{
    protected $priorityRepo;
    protected $kanbanRepo;

    public function __construct()
    {
        $this->priorityRepo = new PriorityRepository();
        $this->kanbanRepo = new KanbanRepository();
    }

    // Priorities
    public function getPriorities()
    {
        return $this->priorityRepo->getAll();
    }

    public function createPriority(array $data)
    {
        return $this->priorityRepo->create($data);
    }

    public function updatePriority(int $id, array $data)
    {
        return $this->priorityRepo->update($id, $data);
    }

    public function deletePriority(int $id)
    {
        return $this->priorityRepo->delete($id);
    }

    // Kanban Categories
    public function getCategories()
    {
        return $this->kanbanRepo->getAll();
    }

    public function createCategory(array $data)
    {
        return $this->kanbanRepo->create($data);
    }

    public function updateCategory(int $id, array $data)
    {
        return $this->kanbanRepo->update($id, $data);
    }

    public function deleteCategory(int $id)
    {
        return $this->kanbanRepo->delete($id);
    }
}
