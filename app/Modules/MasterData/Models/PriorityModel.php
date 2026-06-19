<?php

namespace Modules\MasterData\Models;

use CodeIgniter\Model;

class PriorityModel extends Model
{
    protected $table = 'priorities';
    protected $primaryKey = 'id';
    protected $allowedFields = ['name', 'color', 'level', 'created_at', 'updated_at'];
    protected $useTimestamps = true;
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';
}
