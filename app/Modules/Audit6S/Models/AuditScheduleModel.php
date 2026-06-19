<?php

namespace Modules\Audit6S\Models;

use CodeIgniter\Model;

class AuditScheduleModel extends Model
{
    protected $DBGroup = 'audit6s';
    protected $table = 'AuditSchedules';
    protected $primaryKey = 'id';
    protected $allowedFields = [
        'department_id', 'audit_date', 'lean_facilitator_name', 'auditor_name', 'status', 'createdAt', 'updatedAt'
    ];
    protected $useTimestamps = true;
    protected $createdField  = 'createdAt';
    protected $updatedField  = 'updatedAt';
}
