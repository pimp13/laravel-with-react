<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\PostController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UserController;
use App\Http\Middleware\JwtCookieMiddleware;

Route::prefix('v1')->group(function () {
    Route::apiResource('users', UserController::class);
    Route::patch('/users/{user}/status', [UserController::class, 'changeStatus']);


    Route::apiResource('categories', CategoryController::class);
    Route::apiResource('posts', PostController::class);


    Route::prefix('auth')->group(function () {
        Route::post('/', [AuthController::class, 'authenticate'])->name('authenticate');
        Route::post('/register', [AuthController::class, 'register'])->name('auth.register');
        Route::post('/login', [AuthController::class, 'login'])->name('auth.login');

        Route::middleware(JwtCookieMiddleware::class)->group(function () {
            Route::get('/auth/me', [AuthController::class, 'me'])->name('auth.me');
        });
    });
});
