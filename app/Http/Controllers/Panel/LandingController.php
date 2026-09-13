<?php

namespace App\Http\Controllers\Panel;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class LandingController extends Controller
{
    public function renderPage(): Response
    {
        $stats = cache()->remember('panel.dashboard.stats', now()->addMinutes(5), function () {
            return [
                'postsCount' => Post::count(),
                'usersCount' => User::count(),
                // 'commentsCount' => Comment::count(),
                // 'draftsCount'  => Post::where('visibility', 'draft')->count(),
            ];
        });

        return Inertia::render('panel/index', [
            ...$stats,
            'latestPosts' => Post::latest()
                ->limit(4)
                ->get(['id', 'title', 'visibility', 'created_at']),
        ]);
    }
}
