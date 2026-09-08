<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::inertia('/', 'welcome')->name('home');



Route::get('/blog', function () {
    return Inertia::render('blog');
});

Route::prefix('panel')->group(function () {
    Route::get('/', function () {
        return Inertia::render('panel');
    });

    Route::get('/create-article', function () {
        return Inertia::render('panel/create-article');
    });
});
