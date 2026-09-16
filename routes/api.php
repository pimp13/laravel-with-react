<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\PostController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Http;

Route::middleware(['api', 'resolve'])->prefix('v1')->group(function () {
    Route::apiResource('users', UserController::class);
    Route::patch('/users/{user}/status', [UserController::class, 'changeStatus']);


    Route::apiResource('categories', CategoryController::class);
    Route::patch('/categories/{category}/toggle-active', [CategoryController::class, 'toggleActive']);

    Route::apiResource('posts', PostController::class);
    Route::post('/posts/upload-image', [PostController::class, 'uploadImage']);
    Route::patch('/posts/{post}/status', [PostController::class, 'updateStatus']);


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
    $resp = Http::withHeader('Cookie', '_lsr=s%3Ar2CoVIXT0Eg7k3qybmzCq0anGzIhfCco.gPRf8oUc46dTdt%2FS0rARQmRasMYWv%2B2HyYYTko%2BW4FQ')
        ->post('https://padafand.edus.ir/emis-api/v1/data-provider/get-data-source', [
            "serviceId" => "padafand.edus.ir",
            "key" => "academy-V2/develop/test-v2",
            "params" => [
                "address" => "person_organ_profiles/create",
                "method" => "POST",
                "dservice" => "base_entity",
                "type" => "activity",
                "currentAcademy" => "l4l66ii51ry"
            ]
        ]);
    $resp->throw();

    dump($resp->json());
    dd(data_get($resp->json(), 'Result.data.bodyData.address'));
});
