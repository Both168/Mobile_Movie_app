<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Orchid\Screen\AsSource;
use Orchid\Filters\Filterable;
use Orchid\Filters\Types\Like;
use Orchid\Filters\Types\Where;
use Orchid\Filters\Types\WhereDateStartEnd;

class Banner extends Model
{
    use HasFactory, AsSource, Filterable;

    protected $table = 'banner';

    protected $fillable = [
        'position',
        'movie_id',
        'image',
        'status',
    ];

    /**
     * Get the movie that owns the banner.
     */
    public function movie()
    {
        return $this->belongsTo(\App\Models\Movie::class);
    }

    /**
     * The attributes for which you can use filters in url.
     *
     * @var array
     */
    protected $allowedFilters = [
        'id'         => Where::class,
        'position'   => Where::class,
        'movie_id'   => Where::class,
        'status'     => Where::class,
        'updated_at' => WhereDateStartEnd::class,
        'created_at' => WhereDateStartEnd::class,
    ];

    /**
     * The attributes for which can use sort in url.
     *
     * @var array
     */
    protected $allowedSorts = [
        'id',
        'position',
        'movie_id',
        'status',
        'updated_at',
        'created_at',
    ];
}
