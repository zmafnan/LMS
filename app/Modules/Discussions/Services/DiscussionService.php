<?php

namespace Modules\Discussions\Services;

use Modules\Discussions\Repositories\DiscussionRepository;

class DiscussionService
{
    protected $repository;

    public function __construct()
    {
        $this->repository = new DiscussionRepository();
    }

    /**
     * Retrieve list of messages
     */
    public function getMessagesList(): array
    {
        return $this->repository->getLatestMessages(100);
    }

    /**
     * Save new message with trim operations
     */
    public function postNewMessage(int $userId, string $message): bool
    {
        $data = [
            'user_id' => $userId,
            'message' => trim($message)
        ];
        return $this->repository->createMessage($data) > 0;
    }
}
