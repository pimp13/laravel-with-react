<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('resolve')->group(function () {

    Route::inertia('/', 'welcome')->name('home');


    Route::get('/blog', function () {
        return Inertia::render('blog');
    });

    Route::middleware('jwt')->prefix('panel')->group(function () {
        Route::get('/', function () {
            return Inertia::render('panel', [
                'dataTest' => 'Hello this data sending from laravel',
            ]);
        });

        Route::get('/create-article', function () {
            return Inertia::render('panel/create-article');
        });
        Route::get('/create-article-v2', function () {
            return Inertia::render('panel/create-article-v2');
        });
        Route::get('/create-article-v3', function () {
            return Inertia::render('panel/create-article-v3');
        });
    });

    Route::middleware('guest')->group(function () {
        Route::get('/auth', function () {
            return Inertia::render('auth');
        });
    });
});
