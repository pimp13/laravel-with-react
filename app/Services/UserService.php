<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class UserService
{
    /**
     * Create a new class instance.
     */
    public function __construct()
    {
        //
    }

    public function findAll(): Collection
    {
        return User::orderBy('created_at', 'desc')->withCount('posts')->get();
    }
}
