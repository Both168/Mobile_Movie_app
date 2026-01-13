<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\MovieController;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::get('/listCardsTending', [MovieController::class, 'listCardsTrending']);
Route::get('/dramaListCard', [MovieController::class, 'dramaListCard']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::post('/updateProfile', [AuthController::class, 'updateProfile']);
    Route::post('/userPassword', [AuthController::class, 'updatePassword']);
    Route::get('/myListCards', [MovieController::class, 'myList']);
    Route::get('/mayLike', [MovieController::class, 'mayLike']);
    Route::post('/logout', [AuthController::class, 'logout']);
});
