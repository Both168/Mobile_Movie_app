<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserMovieList extends Model
{
    use HasFactory;

    protected $table = 'user_web_list';

    public $timestamps = false;

    protected $fillable = [
        'user_web_id',
        'movie_id',
    ];

    /**
     * Get the user that owns the list item.
     */
    public function userWeb()
    {
        return $this->belongsTo(UserWeb::class, 'user_web_id');
    }

    /**
     * Get the movie in the list.
     */
    public function movie()
    {
        return $this->belongsTo(Movie::class);
    }
}

