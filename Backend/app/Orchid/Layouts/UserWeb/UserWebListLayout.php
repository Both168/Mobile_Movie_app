<?php

declare(strict_types=1);

namespace App\Orchid\Layouts\UserWeb;

use App\Models\UserWeb;
use Orchid\Screen\Actions\Button;
use Orchid\Screen\Actions\DropDown;
use Orchid\Screen\Actions\Link;
use Orchid\Screen\Components\Cells\DateTimeSplit;
use Orchid\Screen\Fields\Input;
use Orchid\Screen\Layouts\Table;
use Orchid\Screen\TD;
use Orchid\Support\Color;

class UserWebListLayout extends Table
{
    /**
     * @var string
     */
    public $target = 'user_webs';

    /**
     * @return TD[]
     */
    public function columns(): array
    {
        return [
            TD::make('id', __('ID'))
                ->sort()
                ->cantHide()
                ->filter(Input::make()),
            
            TD::make('avarta', __('Avatar'))
                ->width('80px')
                ->render(function (UserWeb $user) {
                    if ($user->avarta && $user->avarta !== '0' && $user->avarta !== '') {
                        $url = asset('storage/' . $user->avarta);
                        return "<img src='{$url}' alt='Avatar' style='width: 32px; height: 32px; object-fit: cover; border-radius: 50%;' />";
                    }
                    return "<div style='width: 32px; height: 32px; border-radius: 50%; background-color: #e5e7eb; display: flex; align-items: center; justify-content: center;'><svg style='width: 20px; height: 20px; color: #9ca3af;' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'></path></svg></div>";
                }),

            TD::make('username', __('Username'))
                ->sort()
                ->cantHide()
                ->filter(Input::make()),

            TD::make('name', __('Name'))
                ->sort()
                ->filter(Input::make()),

            TD::make('is_member', __('Member'))
                ->sort()
                ->render(function (UserWeb $user) {
                    $isMember = $user->is_member == '1' || $user->is_member == 1;
                    $statusText = $isMember ? 'Member' : 'Not Member';
                    $newStatus = $isMember ? 0 : 1;
                    $newStatusText = $newStatus ? 'Member' : 'Not Member';

                    return Button::make($statusText)
                        ->method('updateMemberStatus', [
                            'id' => $user->id,
                            'status' => $newStatus,
                        ])
                        ->type($isMember ? Color::SUCCESS() : Color::DANGER())
                        ->icon($isMember ? 'bs.check-circle' : 'bs.x-circle')
                        ->style('border-radius: 0.25rem;');
                }),

            TD::make('is_ban', __('Banned'))
                ->sort()
                ->render(function (UserWeb $user) {
                    $isBanned = $user->is_ban == '1' || $user->is_ban == 1;
                    $statusText = $isBanned ? 'Banned' : 'Not Banned';
                    $newStatus = $isBanned ? 0 : 1;

                    return Button::make($statusText)
                        ->method('updateBanStatus', [
                            'id' => $user->id,
                            'status' => $newStatus,
                        ])
                        ->type($isBanned ? Color::DANGER() : Color::SUCCESS())
                        ->icon($isBanned ? 'bs.x-circle' : 'bs.check-circle')
                        ->style('border-radius: 0.25rem;');
                }),

            TD::make('is_restric', __('Restricted'))
                ->sort()
                ->render(function (UserWeb $user) {
                    $isRestricted = $user->is_restric == '1' || $user->is_restric == 1;
                    $statusText = $isRestricted ? 'Restricted' : 'Not Restricted';
                    $newStatus = $isRestricted ? 0 : 1;

                    return Button::make($statusText)
                        ->method('updateRestricStatus', [
                            'id' => $user->id,
                            'status' => $newStatus,
                        ])
                        ->type($isRestricted ? Color::WARNING() : Color::SUCCESS())
                        ->icon($isRestricted ? 'bs.lock' : 'bs.unlock')
                        ->style('border-radius: 0.25rem;');
                }),

            TD::make('is_admin', __('Admin'))
                ->sort()
                ->render(function (UserWeb $user) {
                    $isAdmin = $user->is_admin == '1' || $user->is_admin == 1;
                    $statusText = $isAdmin ? 'Admin' : 'Not Admin';
                    $newStatus = $isAdmin ? 0 : 1;

                    return Button::make($statusText)
                        ->method('updateAdminStatus', [
                            'id' => $user->id,
                            'status' => $newStatus,
                        ])
                        ->type($isAdmin ? Color::INFO() : Color::SECONDARY())
                        ->icon($isAdmin ? 'bs.shield-check' : 'bs.shield-x')
                        ->style('border-radius: 0.25rem;');
                }),

            TD::make('created_at', __('Created'))
                ->usingComponent(DateTimeSplit::class)
                ->align(TD::ALIGN_RIGHT)
                ->sort(),

            TD::make('updated_at', __('Last edit'))
                ->usingComponent(DateTimeSplit::class)
                ->align(TD::ALIGN_RIGHT)
                ->sort(),

            TD::make(__('Actions'))
                ->align(TD::ALIGN_CENTER)
                ->width('100px')
                ->render(fn (UserWeb $user) => DropDown::make()
                    ->icon('bs.three-dots-vertical')
                    ->list([
                        Button::make(__('Delete'))
                            ->icon('bs.trash3')
                            ->confirm(__('Once the account is deleted, all of its resources and data will be permanently deleted.'))
                            ->method('remove', [
                                'id' => $user->id,
                            ]),
                    ])),
        ];
    }
}

