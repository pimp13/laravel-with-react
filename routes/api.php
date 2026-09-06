<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UserController;



Route::prefix('v1')->group(function () {
    Route::apiResource('users', UserController::class);
    Route::patch('/users/{user}/status', [UserController::class, 'changeStatus']);
});
