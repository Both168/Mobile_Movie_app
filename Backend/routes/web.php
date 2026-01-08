<?php

use Illuminate\Support\Facades\Route;
use App\Models\Movie;

Route::get('/', function () {
    return ('Hello World');
});

Route::get('/episodes/search-series', function (\Illuminate\Http\Request $request) {
    $query = $request->input('q', '');
    
    if (empty($query)) {
        return response()->json([]);
    }
    
    $series = Movie::where('type', 2)
        ->where('status', 1)
        ->where('title', 'like', '%' . $query . '%')
        ->select('id', 'title')
        ->limit(10)
        ->get()
        ->map(function ($movie) {
            return [
                'id' => $movie->id,
                'title' => $movie->title,
            ];
        });
    
    return response()->json($series);
})->middleware('web')->name('episodes.search-series');

Route::get('/episodes/get-seasons', function (\Illuminate\Http\Request $request) {
    $movieId = (int) $request->input('movie_id', 0);
    
    if (!$movieId) {
        return response()->json([]);
    }
    
    $seasons = \Illuminate\Support\Facades\DB::table('season')
        ->where('movie_id', $movieId)
        ->orderBy('number_of_season', 'asc')
        ->select('id', 'title')
        ->get()
        ->map(function ($season) {
            return [
                'id' => $season->id,
                'title' => $season->title,
            ];
        })
        ->values()
        ->toArray();
    
    return response()->json($seasons);
})->middleware('web')->name('episodes.get-seasons');
