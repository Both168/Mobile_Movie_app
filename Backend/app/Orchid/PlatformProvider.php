<?php

declare(strict_types=1);

namespace App\Orchid;

use Orchid\Platform\Dashboard;
use Orchid\Platform\ItemPermission;
use Orchid\Platform\OrchidServiceProvider;
use Orchid\Screen\Actions\Menu;

class PlatformProvider extends OrchidServiceProvider
{
    /**
     * Bootstrap the application services.
     *
     * @param Dashboard $dashboard
     *
     * @return void
     */
    public function boot(Dashboard $dashboard): void
    {
        parent::boot($dashboard);

        // ...
    }

    /**
     * Register the application menu.
     *
     * @return Menu[]
     */
    public function menu(): array
    {
        return [

            Menu::make('Banners')
                ->icon('bs.images')
                ->route('platform.banners'),

            Menu::make(('Genres'))
                ->icon('bs.tag')
                ->route('platform.genre'),

            Menu::make('Movies')
                ->icon('bs.film')
                ->route('platform.movies'),

            Menu::make('Seasons')
                ->icon('bs.tv')
                ->route('platform.seasons'),

            Menu::make('Episodes')
                ->icon('bs.play-circle')
                ->route('platform.episodes'),

            Menu::make('Web Users')
                ->icon('bs.people')
                ->route('platform.systems.user_webs'),

            Menu::make(__('Users'))
                ->icon('bs.people')
                ->route('platform.systems.users')
                ->permission('platform.systems.users')
                ->title(__('Access Controls')),

            Menu::make(__('Roles'))
                ->icon('bs.shield')
                ->route('platform.systems.roles')
                ->permission('platform.systems.roles')
                ->divider()

        ];
    }

    /**
     * Register permissions for the application.
     *
     * @return ItemPermission[]
     */
    public function permissions(): array
    {
        return [
            ItemPermission::group(__('System'))
                ->addPermission('platform.systems.roles', __('Roles'))
                ->addPermission('platform.systems.users', __('Users'))
                ->addPermission('platform.systems.files.upload', __('File Upload')),
        ];
    }
}
