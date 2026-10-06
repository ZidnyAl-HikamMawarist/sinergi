<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'appName' => config('app.name', 'SINERGI'),
        'version' => '1.0 MVP',
    ]);
})->name('home');
