<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Laravel\Sanctum\HasApiTokens;
use Orchid\Filters\Filterable;
use Orchid\Screen\AsSource;

class UserWeb extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens, AsSource, Filterable;

    protected $table = 'user_web';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name',
        'username',
        'password',
        'is_member',
        'is_ban',
        'is_restric',
        'is_admin',
        'avarta',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        // Password will be hashed automatically by Laravel
    ];

    /**
     * Get the name of the unique identifier for the user.
     * Keep as 'id' for session storage, but we'll use username for authentication.
     *
     * @return string
     */
    public function getAuthIdentifierName()
    {
        return 'id';
    }

    /**
     * Get the unique identifier for the user.
     * This ensures the session stores the ID, not the username.
     *
     * @return mixed
     */
    public function getAuthIdentifier()
    {
        return $this->getKey();
    }

    /**
     * Get the movies in the user's list.
     */
    public function movieList()
    {
        return $this->hasMany(UserMovieList::class, 'user_web_id');
    }

    /**
     * Get the movies through the list relationship.
     */
    public function movies()
    {
        return $this->belongsToMany(Movie::class, 'user_web_list', 'user_web_id', 'movie_id');
    }
}

