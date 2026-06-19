<?php

namespace Modules\Kanban\Repositories;

use Modules\Kanban\Models\KanbanCategoryModel;

class KanbanRepository
{
    protected $model;

    public function __construct()
    {
        $this->model = new KanbanCategoryModel();
    }

    public function getAll()
    {
        return $this->model->orderBy('id', 'ASC')->findAll();
    }

    public function findById(int $id)
    {
        return $this->model->find($id);
    }

    public function create(array $data)
    {
        return $this->model->insert($data);
    }

    public function update(int $id, array $data)
    {
        return $this->model->update($id, $data);
    }

    public function delete(int $id)
    {
        return $this->model->delete($id);
    }
}
