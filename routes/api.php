<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\PostController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UserController;



Route::prefix('v1')->group(function () {
    Route::apiResource('users', UserController::class);
    Route::patch('/users/{user}/status', [UserController::class, 'changeStatus']);


    Route::apiResource('categories', CategoryController::class);
    Route::apiResource('posts', PostController::class);

    Route::post('/auth', [AuthController::class, 'authenticate']);
});
