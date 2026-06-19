<?php

namespace Modules\Kaizen\Models;

use CodeIgniter\Model;

class KaizenSubmissionModel extends Model
{
    protected $DBGroup          = 'kaizen';
    protected $table            = 'KaizenSubmissions';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';
    protected $allowedFields    = [
        'ticket_number',
        'kaizen_title',
        'pic_name',
        'department',
        'submission_date',
        'background',
        'kaizen_type',
        'erc_team',
        'sku',
        'photos_before',
        'photos_after',
        'before_description',
        'after_description',
        'benefits',
        'process_impact',
        'quality_impact',
        'pph_impact',
        'cost_impact',
        'pph_before',
        'pph_after',
        'tct_before',
        'tct_after',
        'rft_before',
        'rft_after',
        'saving_cost',
        'is_implemented',
        'proposers_signature',
        'spv_production_signature',
        'kb_production_signature',
        'asst_manager_production_signature',
        'manager_production_signature',
        'production_technical_signature',
        'qms_signature',
        'director_production_signature',
        'test_date',
        'test_quantity',
        'test_result',
        'validation_status',
        'point',
        'createdAt',
        'updatedAt'
    ];

    // Dates
    protected $useTimestamps = true;
    protected $dateFormat    = 'datetime';
    protected $createdField  = 'createdAt';
    protected $updatedField  = 'updatedAt';
}
