<?php

namespace App\Http\Controllers\Panel;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LandingController extends Controller
{
    public function renderPage(): Response
    {
        $postsCount = Post::count('id');
        $usersCount = User::count('id');
        $latestPosts = Post::orderByDesc('created_at')->limit(4)->get(['id', 'visibility', 'title']);

        $pagePayload = [
            'postsCount' => $postsCount,
            'usersCount' => $usersCount,
            'latestPosts' => $latestPosts,
        ];
        return Inertia::render('panel/index', $pagePayload);
    }
}
