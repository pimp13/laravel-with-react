<?php

namespace App\Http\Controllers\Panel;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LandingController extends Controller
{
    public function renderPage(): Response
    {
        $postsCount = Post::count('id');
        $pagePayload = [
            'postsCount' => $postsCount,
        ];
        return Inertia::render('panel/index', $pagePayload);
    }
}
