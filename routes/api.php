<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UserController;



Route::prefix('v1')->group(function () {
    Route::apiResource('users', UserController::class);
});
