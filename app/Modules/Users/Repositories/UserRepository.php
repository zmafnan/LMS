<?php

namespace Modules\Users\Repositories;

use Modules\Users\Models\UserModel;

class UserRepository
{
    protected $model;

    public function __construct()
    {
        $this->model = new UserModel();
    }

    public function findByUsername(string $username)
    {
        return $this->model->where('username', $username)->first();
    }

    public function findById(int $id)
    {
        return $this->model->find($id);
    }

    public function getAllUsers()
    {
        return $this->model->select('id, username, email, role, avatar_url, created_at')->findAll();
    }

    public function createUser(array $data)
    {
        return $this->model->insert($data);
    }

    public function updateUser(int $id, array $data)
    {
        return $this->model->update($id, $data);
    }

    public function deleteUser(int $id)
    {
        return $this->model->delete($id);
    }
}
