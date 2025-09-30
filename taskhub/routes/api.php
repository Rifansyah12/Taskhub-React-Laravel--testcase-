<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TaskController;

// Auth
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Task (dilindungi Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/tasks', [TaskController::class, 'store']);
    Route::get('/tasks', [TaskController::class, 'index']);
    Route::put('/tasks/{id}/selesaikan', [TaskController::class, 'selesaikan']);
    Route::get('/tasks/reminder', [TaskController::class, 'reminder']);
});
