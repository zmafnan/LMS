<?php

namespace Modules\MultiSkill\Models;

use CodeIgniter\Model;

class EmployeeModel extends Model
{
    protected $table = 'employees';
    protected $primaryKey = 'id';
    protected $allowedFields = [
        'nik', 'employee_name', 'position', 'section', 'line',
        'skill_1', 'skill_1_grade', 'skill_2', 'skill_2_grade',
        'skill_3', 'skill_3_grade', 'skill_4', 'skill_4_grade',
        'skill_5', 'skill_5_grade', 'skill_6', 'skill_6_grade',
        'skill_7', 'skill_7_grade', 'skill_8', 'skill_8_grade',
        'skill_9', 'skill_9_grade', 'skill_10', 'skill_10_grade',
        'join_date', 'status', 'created_at', 'updated_at'
    ];
    protected $useTimestamps = true;
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';
}
