<?php

declare(strict_types=1);

namespace App\Orchid\Screens;

use App\Models\Movie;
use App\Models\UserWeb;
use Orchid\Screen\Screen;
use Orchid\Support\Facades\Layout;

class PlatformScreen extends Screen
{
    public function query(): iterable
    {
        return [
            'total_movies' => Movie::count(),
            'total_films' => Movie::where('type', 1)->count(),
            'total_series' => Movie::where('type', 2)->count(),
            'total_user_web' => UserWeb::count(),
        ];
    }

    public function name(): ?string
    {
        return 'Dashboard';
    }

    public function description(): ?string
    {
        return 'Overview of your application.';
    }

    public function commandBar(): iterable
    {
        return [];
    }

    public function layout(): iterable
    {
        return [
            Layout::view('orchid.dashboard-stats'),
            Layout::view('platform::partials.update-assets'),
        ];
    }
}
