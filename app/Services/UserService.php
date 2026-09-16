<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Cache;

class UserService
{
    /**
     * Create a new class instance.
     */
    public function __construct()
    {
        //
    }

    public function findAll()
    {
        return Cache::remember("users.list.with.posts.count", now()->addHours(24), function () {
            return User::orderBy('created_at', 'desc')->withCount('posts')->get()->toArray();
        });
    }
}
