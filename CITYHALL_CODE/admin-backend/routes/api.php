<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\QueueController;
use App\Http\Controllers\HRFormController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::get('/departments', [DepartmentController::class, 'index']);
Route::get('/departments/{id}', [DepartmentController::class, 'show']);

// Queue management routes (public for kiosk access)
Route::post('/queue/generate', [QueueController::class, 'generateQueueNumber']);
Route::get('/queue/status/{departmentId}', [QueueController::class, 'getQueueStatus']);
Route::post('/queue/complete', [QueueController::class, 'completeQueue']);
Route::post('/queue/update-status', [QueueController::class, 'updateQueueStatus']);
Route::get('/queue/latest-updates', [QueueController::class, 'getLatestQueueUpdates']);
Route::get('/queue/latest-update/{departmentId}', [QueueController::class, 'getLatestQueueUpdate']);
Route::post('/queue/reset/{departmentId}', [QueueController::class, 'resetQueue']);
Route::get('/queue/history/{departmentId}', [QueueController::class, 'getTransactionHistory']);
Route::get('/queue/number/{id}', [QueueController::class, 'getQueueNumberById']);

// Set and get currently serving queue number
Route::post('/queue/currently-serving', [\App\Http\Controllers\QueueController::class, 'setCurrentlyServing']);
Route::get('/queue/currently-serving', [\App\Http\Controllers\QueueController::class, 'getCurrentlyServingAll']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::put('/profile/update', [AuthController::class, 'updateProfile']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::get('/analytics', [AnalyticsController::class, 'query']);
    Route::apiResource('departments', DepartmentController::class)->except(['index', 'show']);
    Route::post('departments/{department}/transactions', [DepartmentController::class, 'storeTransaction']);
    Route::put('departments/{department}/transactions/{transaction}', [DepartmentController::class, 'updateTransaction']);
    Route::apiResource('users', App\Http\Controllers\UserController::class)->except(['store']);
    Route::post('/hr/checklist-pdf', [HRFormController::class, 'generateChecklistPdf']);
});
