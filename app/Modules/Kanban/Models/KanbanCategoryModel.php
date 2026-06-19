<?php

namespace Modules\Kanban\Models;

use CodeIgniter\Model;

class KanbanCategoryModel extends Model
{
    protected $table = 'kanban_categories';
    protected $primaryKey = 'id';
    protected $allowedFields = ['name', 'color', 'created_at', 'updated_at'];
    protected $useTimestamps = true;
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';
}
