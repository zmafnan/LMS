<?php

namespace Modules\Audit6S\Models;

use CodeIgniter\Model;

class NonProductionAuditModel extends Model
{
    protected $DBGroup = 'audit6s';
    protected $table = 'NonProductionAudits';
    protected $primaryKey = 'id';
    protected $allowedFields = [
        'schedule_id', 'department_id', 'audit_date', 'auditor_name', 'lean_facilitator_name',
        'previous_findings', 'current_findings', 'sort_score', 'set_in_order_score',
        'shine_score', 'standardize_score', 'sustain_score', 'safety_score', 'photo_url',
        'auditor_signature', 'facilitator_signature', 'department_signature', 'createdAt', 'updatedAt'
    ];
    protected $useTimestamps = true;
    protected $createdField  = 'createdAt';
    protected $updatedField  = 'updatedAt';
}
