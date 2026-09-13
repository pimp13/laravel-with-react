<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\Post;
use App\Models\User;

class PostPolicy
{
    /**
     * چه کسانی می‌توانند نوشته‌ها را ببینند؟
     */
    public function viewAny(User $user): bool
    {
        return in_array($user->role, [
            UserRole::EDITOR,
            UserRole::AUTHOR,
            UserRole::CONTRIBUTOR,
        ], true);
    }

    /**
     * چه کسی می‌تواند یک نوشته را ببیند؟
     */
    public function view(User $user, Post $post): bool
    {
        return match ($user->role) {
            UserRole::EDITOR => true,

            UserRole::AUTHOR =>
            $post->user_id === $user->id,

            UserRole::CONTRIBUTOR =>
            $post->user_id === $user->id,

            default => false,
        };
    }

    /**
     * ایجاد نوشته
     */
    public function create(User $user): bool
    {
        return in_array($user->role, [
            UserRole::EDITOR,
            UserRole::AUTHOR,
            UserRole::CONTRIBUTOR,
        ], true);
    }

    /**
     * ویرایش نوشته
     */
    public function update(User $user, Post $post): bool
    {
        return match ($user->role) {
            UserRole::EDITOR => true,

            UserRole::AUTHOR =>
            $post->user_id === $user->id,

            UserRole::CONTRIBUTOR =>
            $post->user_id === $user->id,

            default => false,
        };
    }

    /**
     * انتشار نوشته
     */
    public function publish(User $user, Post $post): bool
    {
        return match ($user->role) {
            UserRole::EDITOR => true,

            UserRole::AUTHOR =>
            $post->user_id === $user->id,

            default => false,
        };
    }

    /**
     * حذف نوشته
     */
    public function delete(User $user, Post $post): bool
    {
        return match ($user->role) {
            UserRole::EDITOR => true,

            UserRole::AUTHOR =>
            $post->user_id === $user->id,

            default => false,
        };
    }
}
