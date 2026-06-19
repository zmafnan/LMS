<?php

namespace Modules\Discussions\Repositories;

use Modules\Discussions\Models\DiscussionMessageModel;

class DiscussionRepository
{
    protected $model;

    public function __construct()
    {
        $this->model = new DiscussionMessageModel();
    }

    /**
     * Get the latest messages joined with user info
     */
    public function getLatestMessages(int $limit = 100)
    {
        return $this->model->db->table('discussion_messages m')
            ->select('m.id, m.user_id, u.username, u.role, m.message, m.created_at')
            ->join('users u', 'u.id = m.user_id')
            ->orderBy('m.created_at', 'ASC')
            ->limit($limit)
            ->get()
            ->getResultArray();
    }

    /**
     * Store new message in database
     */
    public function createMessage(array $data)
    {
        return $this->model->insert($data);
    }
}
