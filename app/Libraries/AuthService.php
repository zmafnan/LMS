<?php

namespace App\Libraries;

class AuthService
{
    /**
     * @var array|null Current logged-in user attributes
     */
    private static $currentUser = null;

    /**
     * Set the current authenticated user context
     *
     * @param array $user
     */
    public static function setUser(array $user): void
    {
        self::$currentUser = $user;
    }

    /**
     * Get the current authenticated user
     *
     * @return array|null
     */
    public static function user(): ?array
    {
        return self::$currentUser;
    }

    /**
     * Get the active user's ID
     *
     * @return int|null
     */
    public static function id(): ?int
    {
        return self::$currentUser ? (int)self::$currentUser['id'] : null;
    }

    /**
     * Get the active user's role
     *
     * @return string|null
     */
    public static function role(): ?string
    {
        return self::$currentUser ? self::$currentUser['role'] : null;
    }

    /**
     * Check if the active user matches specific roles
     *
     * @param array $roles Allowed roles (e.g. ['admin', 'leader'])
     * @return bool
     */
    public static function checkRole(array $roles): bool
    {
        if (!self::$currentUser) {
            return false;
        }
        return in_array(strtolower(self::$currentUser['role']), array_map('strtolower', $roles));
    }
}
