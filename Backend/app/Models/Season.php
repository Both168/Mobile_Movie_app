<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Orchid\Screen\AsSource;
use Orchid\Filters\Filterable;
use Orchid\Filters\Types\Like;
use Orchid\Filters\Types\Where;
use Orchid\Filters\Types\WhereDateStartEnd;

class Season extends Model
{
    use HasFactory, AsSource, Filterable;

    protected $table = 'season';

    protected $fillable = [
        'title',
        'description',
        'number_of_season',
        'movie_id',
    ];

    /**
     * Get the movie that owns the season.
     */
    public function movie()
    {
        return $this->belongsTo(Movie::class);
    }

    /**
     * Get the episodes for the season.
     */
    public function episodes()
    {
        return $this->hasMany(Episode::class);
    }

    /**
     * Disable timestamps since table doesn't have created_at/updated_at columns.
     */
    public $timestamps = false;

    /**
     * Attributes allowed for filtering.
     *
     * @var array<string, string>
     */
    protected $allowedFilters = [
        'id' => Where::class,
        'title' => Like::class,
        'movie_id' => Where::class,
        'number_of_season' => Where::class,
    ];

    /**
     * Attributes allowed for sorting.
     *
     * @var array<int, string>
     */
    protected $allowedSorts = [
        'id',
        'title',
        'movie_id',
        'number_of_season',
    ];
}

