<?php

namespace Modules\Audit6S\Models;

use CodeIgniter\Model;

class DepartmentModel extends Model
{
    protected $DBGroup = 'audit6s';
    protected $table = 'Departments';
    protected $primaryKey = 'id';
    protected $allowedFields = [
        'name', 'type', 'createdAt', 'updatedAt'
    ];
    protected $useTimestamps = true;
    protected $createdField  = 'createdAt';
    protected $updatedField  = 'updatedAt';
}
