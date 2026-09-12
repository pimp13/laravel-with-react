<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\PostController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Arr;

Route::middleware(['api', 'resolve'])->prefix('v1')->group(function () {
    Route::apiResource('users', UserController::class);
    Route::patch('/users/{user}/status', [UserController::class, 'changeStatus']);


    Route::apiResource('categories', CategoryController::class);
    Route::apiResource('posts', PostController::class);
    Route::post('/posts/upload-image', [PostController::class, 'uploadImage']);


    Route::prefix('auth')->group(function () {
        Route::post('/', [AuthController::class, 'authenticate'])->name('authenticate');

        Route::middleware('guest')->group(function () {
            Route::post('/register', [AuthController::class, 'register'])->name('auth.register');
            Route::post('/login', [AuthController::class, 'login'])->name('auth.login');
        });

        Route::middleware('jwt')->group(function () {
            Route::get('/me', [AuthController::class, 'me'])->name('auth.me');
            Route::post('/logout', [AuthController::class, 'logout'])->name('auth.logout');
        });
    });
});


Route::get('/tests', function () {
    $array = [1, 2, 3, 4, 5];
    dd(
        Arr::first($array, fn($val) => $val)
    );
});
