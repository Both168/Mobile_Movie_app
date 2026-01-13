<?php

declare(strict_types=1);

namespace App\Orchid\Layouts\UserWeb;

use Orchid\Screen\Field;
use Orchid\Screen\Fields\Input;
use Orchid\Screen\Fields\Picture;
use Orchid\Screen\Fields\Select;
use Orchid\Screen\Layouts\Rows;

class UserWebEditLayout extends Rows
{
    /**
     * The screen's layout elements.
     *
     * @return Field[]
     */
    public function fields(): array
    {
        return [
            Input::make('user_web.name')
                ->type('text')
                ->max(255)
                ->title(__('Full Name'))
                ->placeholder(__('Enter full name')),

            Input::make('user_web.username')
                ->type('text')
                ->required()
                ->max(255)
                ->title(__('Username'))
                ->placeholder(__('Enter username'))
                ->help(__('Username must be unique.')),

            Picture::make('user_web.avarta')
                ->title(__('Avatar'))
                ->target('user_web')
                ->storage('public')
                ->path('avatars')
                ->help(__('Upload user avatar image.')),

            Select::make('user_web.is_member')
                ->title(__('Member Status'))
                ->options([
                    '1' => __('Yes'),
                    '0' => __('No'),
                    '' => __('Not Set'),
                ])
                ->help(__('Is this user a member?')),

            Select::make('user_web.is_ban')
                ->title(__('Ban Status'))
                ->options([
                    '1' => __('Yes'),
                    '0' => __('No'),
                    '' => __('Not Set'),
                ])
                ->help(__('Is this user banned?')),

            Select::make('user_web.is_restric')
                ->title(__('Restriction Status'))
                ->options([
                    '1' => __('Yes'),
                    '0' => __('No'),
                    '' => __('Not Set'),
                ])
                ->help(__('Is this user restricted?')),

            Select::make('user_web.is_admin')
                ->title(__('Admin Status'))
                ->options([
                    '1' => __('Yes'),
                    '0' => __('No'),
                ])
                ->help(__('Is this user an admin?')),
        ];
    }
}

