<?php

declare(strict_types=1);

namespace App\Orchid\Screens\UserWeb;

use App\Models\UserWeb;
use App\Orchid\Layouts\UserWeb\UserWebListLayout;
use Illuminate\Http\Request;
use Orchid\Screen\Actions\Link;
use Orchid\Screen\Screen;
use Orchid\Support\Facades\Layout;
use Orchid\Support\Facades\Toast;

class UserWebListScreen extends Screen
{
    /**
     * Fetch data to be displayed on the screen.
     *
     * @return array
     */
    public function query(): iterable
    {
        return [
            'user_webs' => UserWeb::filters()
                ->defaultSort('id', 'desc')
                ->paginate(),
        ];
    }

    /**
     * The name of the screen displayed in the header.
     */
    public function name(): ?string
    {
        return 'Web Users Management';
    }

    /**
     * Display header description.
     */
    public function description(): ?string
    {
        return 'A comprehensive list of all registered web users.';
    }

    /**
     * The screen's action buttons.
     *
     * @return \Orchid\Screen\Action[]
     */
    public function commandBar(): iterable
    {
        return [];
    }

    /**
     * The screen's layout elements.
     *
     * @return string[]|\Orchid\Screen\Layout[]
     */
    public function layout(): iterable
    {
        return [
            UserWebListLayout::class,
        ];
    }

    /**
     * Remove user web record.
     */
    public function remove(Request $request): void
    {
        UserWeb::findOrFail($request->get('id'))->delete();

        Toast::info(__('User was removed'));
    }

    /**
     * Update member status
     */
    public function updateMemberStatus(Request $request): void
    {
        $user = UserWeb::findOrFail($request->input('id'));
        $user->is_member = (string) $request->input('status');
        $user->save();

        $statusText = $user->is_member ? 'Member' : 'Not Member';
        Toast::info("Member status updated to {$statusText}!");
    }

    /**
     * Update ban status
     */
    public function updateBanStatus(Request $request): void
    {
        $user = UserWeb::findOrFail($request->input('id'));
        $user->is_ban = (string) $request->input('status');
        $user->save();

        $statusText = $user->is_ban ? 'Banned' : 'Not Banned';
        Toast::info("Ban status updated to {$statusText}!");
    }

    /**
     * Update restriction status
     */
    public function updateRestricStatus(Request $request): void
    {
        $user = UserWeb::findOrFail($request->input('id'));
        $user->is_restric = (string) $request->input('status');
        $user->save();

        $statusText = $user->is_restric ? 'Restricted' : 'Not Restricted';
        Toast::info("Restriction status updated to {$statusText}!");
    }

    /**
     * Update admin status
     */
    public function updateAdminStatus(Request $request): void
    {
        $user = UserWeb::findOrFail($request->input('id'));
        $user->is_admin = (int) $request->input('status');
        $user->save();

        $statusText = $user->is_admin ? 'Admin' : 'Not Admin';
        Toast::info("Admin status updated to {$statusText}!");
    }
}

