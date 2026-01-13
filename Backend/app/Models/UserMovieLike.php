<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserMovieLike extends Model
{
    protected $table = 'user_movie_likes';

    protected $fillable = [
        'user_web_id',
        'movie_id',
    ];

    public function userWeb()
    {
        return $this->belongsTo(UserWeb::class, 'user_web_id');
    }

    public function movie()
    {
        return $this->belongsTo(Movie::class);
    }
}
