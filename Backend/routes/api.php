<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BannerController;
use App\Http\Controllers\Api\MovieController;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::get('/banner', [BannerController::class, 'index']);
Route::get('/listCardsTending', [MovieController::class, 'listCardsTrending']);
Route::get('/dramaListCard', [MovieController::class, 'dramaListCard']);
Route::get('/seriesCards', [MovieController::class, 'seriesCards']);
Route::get('/seriesGenre', [MovieController::class, 'seriesGenere']);
Route::get('/moviesCards', [MovieController::class, 'moviesCards']);
Route::get('/moviesGenre', [MovieController::class, 'moviesGenre']);
Route::get('/searchAll', [MovieController::class, 'searchAll']);
Route::get('/searchSeries', [MovieController::class, 'searchSeries']);
Route::get('/searchMovies', [MovieController::class, 'searchMovies']);
Route::match(['GET', 'POST'], '/moviesDetail', [MovieController::class, 'moviesDetail']);
Route::match(['GET', 'POST'], '/moviesSuggest', [MovieController::class, 'moviesSuggest']);
Route::match(['GET', 'POST'], '/seriesDetail', [MovieController::class, 'seriesDetail']);
Route::match(['GET', 'POST'], '/seriesSuggest', [MovieController::class, 'seriesSuggest']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::post('/updateProfile', [AuthController::class, 'updateProfile']);
    Route::post('/userPassword', [AuthController::class, 'updatePassword']);
    Route::get('/myListCards', [MovieController::class, 'myList']);
    Route::get('/mayLike', [MovieController::class, 'mayLike']);
    Route::match(['GET', 'POST'], '/checkList', [MovieController::class, 'checkList']);
    Route::match(['GET', 'POST'], '/checkFav', [MovieController::class, 'checkFav']);
    Route::post('/addMovieList', [MovieController::class, 'addMovieList']);
    Route::post('/removeMovieList', [MovieController::class, 'removeMovieList']);
    Route::post('/addMovieFav', [MovieController::class, 'addMovieFav']);
    Route::post('/removeMovieFav', [MovieController::class, 'removeMovieFav']);
    Route::post('/logout', [AuthController::class, 'logout']);
});
