<?php

namespace Modules\Users\Services;

use Modules\Users\Repositories\UserRepository;
use App\Libraries\JWT;

class UserService
{
    protected $repository;

    public function __construct()
    {
        $this->repository = new UserRepository();
    }

    /**
     * Authenticate user credentials and issue a JWT
     */
    public function authenticate(string $username, string $password): ?array
    {
        $user = $this->repository->findByUsername($username);
        if (!$user) {
            return null;
        }

        if (!password_verify($password, $user['password'])) {
            return null;
        }

        // Generate JWT
        $token = JWT::generate([
            'id'       => $user['id'],
            'username' => $user['username'],
            'email'    => $user['email'],
            'role'     => $user['role']
        ]);

        return [
            'token' => $token,
            'user'  => [
                'id'         => $user['id'],
                'username'   => $user['username'],
                'email'      => $user['email'],
                'role'       => $user['role'],
                'avatar_url' => $user['avatar_url'] ?? null,
            ]
        ];
    }

    /**
     * List all users
     */
    public function getUsersList(): array
    {
        return $this->repository->getAllUsers();
    }

    public function getUserProfile(int $id): ?array
    {
        $user = $this->repository->findById($id);
        if (!$user) {
            return null;
        }

        unset($user['password']);
        return $user;
    }

    /**
     * Register/Create new user
     */
    public function createUser(array $data): bool
    {
        $data['password'] = password_hash($data['password'], PASSWORD_BCRYPT);
        return $this->repository->createUser($data) > 0;
    }

    /**
     * Edit existing user attributes
     */
    public function updateUser(int $id, array $data): bool
    {
        if (isset($data['password']) && !empty($data['password'])) {
            $data['password'] = password_hash($data['password'], PASSWORD_BCRYPT);
        } else {
            unset($data['password']);
        }
        return $this->repository->updateUser($id, $data);
    }

    public function updateProfile(int $id, array $data): ?array
    {
        $allowed = array_intersect_key($data, array_flip(['username', 'email', 'avatar_url']));
        if (empty($allowed)) {
            return $this->getUserProfile($id);
        }

        if (!$this->repository->updateUser($id, $allowed)) {
            return null;
        }

        return $this->getUserProfile($id);
    }

    /**
     * Terminate user account
     */
    public function deleteUser(int $id): bool
    {
        return $this->repository->deleteUser($id);
    }
}
