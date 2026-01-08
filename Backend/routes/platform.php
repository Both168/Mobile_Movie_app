<?php

declare(strict_types=1);
use App\Orchid\Screens\GenreScreen;
use App\Orchid\Screens\PlatformScreen;
use App\Orchid\Screens\Role\RoleEditScreen;
use App\Orchid\Screens\Role\RoleListScreen;
use App\Orchid\Screens\User\UserEditScreen;
use App\Orchid\Screens\User\UserListScreen;
use App\Orchid\Screens\User\UserProfileScreen;
use App\Orchid\Screens\UserWeb\UserWebListScreen;
use Illuminate\Support\Facades\Route;
use Tabuna\Breadcrumbs\Trail;
use App\Orchid\Screens\Movie\MovieScreen;
use App\Orchid\Screens\Movie\CreateMovieScreen;
use App\Orchid\Screens\BannerScreen;
use App\Orchid\Screens\SeasonScreen;
use App\Orchid\Screens\EpisodeScreen;
/*
|--------------------------------------------------------------------------
| Dashboard Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the need "dashboard" middleware group. Now create something great!
|
*/

// Main
Route::screen('/main', PlatformScreen::class)
    ->name('platform.main');

// Platform > Profile
Route::screen('profile', UserProfileScreen::class)
    ->name('platform.profile')
    ->breadcrumbs(fn (Trail $trail) => $trail
        ->parent('platform.index')
        ->push(__('Profile'), route('platform.profile')));

// Platform > System > Users > User
Route::screen('users/{user}/edit', UserEditScreen::class)
    ->name('platform.systems.users.edit')
    ->breadcrumbs(fn (Trail $trail, $user) => $trail
        ->parent('platform.systems.users')
        ->push($user->name, route('platform.systems.users.edit', $user)));

// Platform > System > Users > Create
Route::screen('users/create', UserEditScreen::class)
    ->name('platform.systems.users.create')
    ->breadcrumbs(fn (Trail $trail) => $trail
        ->parent('platform.systems.users')
        ->push(__('Create'), route('platform.systems.users.create')));

// Platform > System > Users
Route::screen('users', UserListScreen::class)
    ->name('platform.systems.users')
    ->breadcrumbs(fn (Trail $trail) => $trail
        ->parent('platform.index')
        ->push(__('Users'), route('platform.systems.users')));
// Platform > System > Web Users
Route::screen('user-webs', UserWebListScreen::class)
    ->name('platform.systems.user_webs')
    ->breadcrumbs(fn (Trail $trail) => $trail
        ->parent('platform.index')
        ->push(__('Web Users'), route('platform.systems.user_webs')));

// Platform > System > Roles > Role
Route::screen('roles/{role}/edit', RoleEditScreen::class)
    ->name('platform.systems.roles.edit')
    ->breadcrumbs(fn (Trail $trail, $role) => $trail
        ->parent('platform.systems.roles')
        ->push($role->name, route('platform.systems.roles.edit', $role)));

// Platform > System > Roles > Create
Route::screen('roles/create', RoleEditScreen::class)
    ->name('platform.systems.roles.create')
    ->breadcrumbs(fn (Trail $trail) => $trail
        ->parent('platform.systems.roles')
        ->push(__('Create'), route('platform.systems.roles.create')));

// Platform > System > Roles
Route::screen('roles', RoleListScreen::class)
    ->name('platform.systems.roles')
    ->breadcrumbs(fn (Trail $trail) => $trail
        ->parent('platform.index')
        ->push(__('Roles'), route('platform.systems.roles')));

// Platform > System > Genres
Route::screen('genres', GenreScreen::class)
    ->name('platform.genre')
    ->breadcrumbs(function(Trail $trail){
        return $trail
            ->parent('platform.index')
            ->push('Genres');
    });

// Platform > System > Movies
Route::screen('movies', MovieScreen::class)
    ->name('platform.movies')
    ->breadcrumbs(function(Trail $trail){
        return $trail
        ->parent('platform.index')
        ->push('Movies', route('platform.movies'));
    });
Route::screen('movies/create', CreateMovieScreen::class)
    ->name('platform.movies.create')
    ->breadcrumbs(function(Trail $trail){
        return $trail
        ->parent('platform.movies')
        ->push('Create');
    });

// Platform > System > Banners
Route::screen('banners', BannerScreen::class)
    ->name('platform.banners')
    ->breadcrumbs(function(Trail $trail){
        return $trail
        ->parent('platform.index')
        ->push('Banners', route('platform.banners'));
    });

// Platform > System > Seasons
Route::screen('seasons', SeasonScreen::class)
    ->name('platform.seasons')
    ->breadcrumbs(function(Trail $trail){
        return $trail
            ->parent('platform.index')
            ->push('Seasons', route('platform.seasons'));
    });

// Platform > System > Episodes
Route::screen('episodes', EpisodeScreen::class)
    ->name('platform.episodes')
    ->breadcrumbs(function(Trail $trail){
        return $trail
            ->parent('platform.index')
            ->push('Episodes', route('platform.episodes'));
    });
Route::post('episodes/getSeasonsByMovie', [EpisodeScreen::class, 'getSeasonsByMovie'])
    ->name('platform.systems.episodes.getSeasonsByMovie');