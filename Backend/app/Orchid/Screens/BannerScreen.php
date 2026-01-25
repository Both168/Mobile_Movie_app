<?php

namespace App\Orchid\Screens;

use App\Models\Banner;
use App\Models\Movie;
use Orchid\Screen\Screen;
use Orchid\Screen\Fields\Input;
use Orchid\Screen\Fields\Select;
use Orchid\Screen\Fields\Upload;
use Orchid\Screen\Fields\Switcher;
use Orchid\Support\Facades\Layout;
use Orchid\Screen\Actions\ModalToggle;
use Orchid\Screen\Actions\Button;
use Illuminate\Http\Request;
use Orchid\Support\Facades\Toast;
use Orchid\Screen\TD;
use Orchid\Support\Color;
use Orchid\Attachment\Models\Attachment;

class BannerScreen extends Screen
{
    /**
     * Fetch data to be displayed on the screen.
     *
     * @return array
     */
    public function query(?Banner $banner = null): iterable
    {
        return [
            'banners' => Banner::with('movie')
                ->filters()
                ->defaultSort('id', 'desc')
                ->paginate(10),
            'banner' => $banner,
        ];
    }

    /**
     * The name of the screen displayed in the header.
     *
     * @return string|null
     */
    public function name(): ?string
    {
        return 'Banners Management';
    }

    /**
     * The screen's action buttons.
     *
     * @return \Orchid\Screen\Action[]
     */
    public function commandBar(): iterable
    {
        return [
            ModalToggle::make('Create')
                ->modal('bannerModal')
                ->method('createBanner')
                ->icon('bs.plus-circle'),
        ];
    }

    /**
     * The screen's layout elements.
     *
     * @return \Orchid\Screen\Layout[]|string[]
     */
    public function layout(): iterable
    {
        return [
            // List display layout
            Layout::table('banners', [
                TD::make('id')
                    ->sort(),
                TD::make('image', 'Thumbnail')
                    ->render(function (Banner $banner) {
                        $attachment = Attachment::find($banner->image);

                        if (! $attachment) {
                            return 'None';
                        }

                        $url = $attachment->url();
                        return "<img src='{$url}' width='40' alt='Banner image' />";
                    }),
                TD::make('movie_id', 'Movie')
                    ->sort()
                    ->filter(
                        Select::make()
                            ->empty('All movies')
                            ->options(
                                Movie::orderBy('title')->pluck('title', 'id')->toArray()
                            )
                    )
                    ->render(function (Banner $banner) {
                        if (!$banner->movie_id || !$banner->movie) {
                            return '—';
                        }
                        return $banner->movie->title;
                    }),
                TD::make('position')
                    ->sort()
                    ->filter(
                        Select::make()
                            ->empty('All positions')
                            ->options([
                                1 => 'Home page',
                                2 => 'Films page',
                                3 => 'Series page',
                            ])
                    )
                    ->render(function (Banner $banner) {
                        $positions = [
                            1 => 'Home page',
                            2 => 'Films page',
                            3 => 'Series page',
                        ];
                        return $positions[$banner->position] ?? 'Unknown';
                    }),
                TD::make('status')
                    ->sort()
                    ->filter(
                        Select::make()
                            ->empty()
                            ->options([
                                1 => 'Active',
                                0 => 'Inactive',
                            ])
                    )
                    ->render(function (Banner $banner) {
                        $statusText = $banner->status ? 'Active' : 'Inactive';
                        $newStatus = $banner->status ? 0 : 1;
                        $newStatusText = $newStatus ? 'Active' : 'Inactive';

                        return Button::make($statusText)
                            ->method('updateStatus', [
                                'id' => $banner->id,
                                'status' => $newStatus,
                            ])
                            ->type($banner->status ? Color::SUCCESS() : Color::DANGER())
                            ->icon($banner->status ? 'bs.check-circle' : 'bs.x-circle')
                            ->style('border-radius: 0.25rem;');
                    }),
                TD::make('created_at', 'Created')
                    ->sort()
                    ->render(fn (Banner $banner) => $banner->created_at ? $banner->created_at->format('Y-m-d') : '—'),
                TD::make('Actions')
                    ->alignRight()
                    ->render(function (Banner $banner) {
                        $editButton = ModalToggle::make('Edit')
                            ->modal('editBannerModal')
                            ->method('updateBanner')
                            ->icon('bs.pencil')
                            ->type(Color::WARNING())
                            ->asyncParameters([
                                'banner' => $banner->id,
                            ]);

                        $deleteButton = Button::make('Delete')
                            ->confirm('Are you sure you want to delete this banner?')
                            ->icon('bs.trash')
                            ->type(Color::DANGER())
                            ->method('deleteBanner', ['id' => $banner->id]);

                        return view('orchid.Banner.banner-actions', [
                            'editButton' => $editButton,
                            'deleteButton' => $deleteButton,
                        ]);
                    }),
            ]),

            // Create banner modal layout
            Layout::modal('bannerModal', Layout::rows([
                Upload::make('banner.image')
                    ->title('Image')
                    ->storage('public')
                    ->disk('public')
                    ->url('/storage/')
                    ->maxFiles(1)
                    ->acceptedFiles('image/*')
                    ->maxFileSize(2)
                    ->help('Only one image is allowed (max 2MB).')
                    ->required(),
                Select::make('banner.movie_id')
                    ->title('Movie')
                    ->fromModel(Movie::class, 'title')
                    ->empty('Select movie')
                    ->help('Optional: Link this banner to a movie'),
                Select::make('banner.position')
                    ->title('Position')
                    ->options([
                        1 => 'Home page',
                        2 => 'Films page',
                        3 => 'Series page',
                    ])
                    ->empty('Select position')
                    ->required(),
                Switcher::make('banner.status')
                    ->title('Active')
                    ->sendTrueOrFalse()
                    ->value(true),
            ]))
                ->title('Create Banner')
                ->applyButton('Save'),

            // Edit banner modal layout
            Layout::modal('editBannerModal', Layout::rows([
                Upload::make('banner.image')
                    ->title('Image')
                    ->storage('public')
                    ->disk('public')
                    ->url('/storage/')
                    ->maxFiles(1)
                    ->acceptedFiles('image/*')
                    ->maxFileSize(2)
                    ->help('Only one image is allowed (max 2MB).'),
                Select::make('banner.movie_id')
                    ->title('Movie')
                    ->fromModel(Movie::class, 'title')
                    ->empty('Select movie')
                    ->help('Optional: Link this banner to a movie'),
                Select::make('banner.position')
                    ->title('Position')
                    ->options([
                        1 => 'Home page',
                        2 => 'Films page',
                        3 => 'Series page',
                    ])
                    ->empty('Select position')
                    ->required(),
                Switcher::make('banner.status')
                    ->title('Active')
                    ->sendTrueOrFalse(),
            ]))
                ->title('Edit Banner')
                ->applyButton('Update')
                ->deferred('getBanner'),
        ];
    }

    /**
     * Create a new banner
     */
    public function createBanner(Request $request)
    {
        $request->validate([
            'banner.image' => 'required|array|max:1',
            'banner.image.*' => 'required|integer|exists:attachments,id',
            'banner.position' => 'required|in:1,2,3',
            'banner.movie_id' => 'nullable|integer|exists:movies,id',
            'banner.status' => 'nullable|boolean',
        ]);

        $banner = new Banner();
        $image = $request->input('banner.image', []);
        $banner->image = is_array($image) ? ($image[0] ?? null) : $image;
        $banner->movie_id = $request->input('banner.movie_id');
        $banner->position = (int) $request->input('banner.position');
        $banner->status = $request->input('banner.status', true) ? 1 : 0;
        $banner->save();

        Toast::info('Banner created successfully!');
    }

    /**
     * Get banner for editing
     */
    public function getBanner(Banner $banner): iterable
    {
        // Ensure image is set as array for Upload field
        if ($banner->image) {
            $banner->image = [$banner->image];
        }

        return [
            'banner' => $banner,
        ];
    }

    /**
     * Update banner
     */
    public function updateBanner(Request $request, Banner $banner): void
    {
        $request->validate([
            'banner.position' => 'required|in:1,2,3',
            'banner.movie_id' => 'nullable|integer|exists:movies,id',
            'banner.image' => 'nullable|array|max:1',
            'banner.image.*' => 'nullable|integer|exists:attachments,id',
            'banner.status' => 'nullable|boolean',
        ]);

        $banner->movie_id = $request->input('banner.movie_id');
        $banner->position = (int) $request->input('banner.position');
        $banner->status = $request->has('banner.status') ? ($request->input('banner.status') ? 1 : 0) : $banner->status;

        // Handle image upload (only update if new image is provided)
        if ($request->has('banner.image') && !empty($request->input('banner.image'))) {
            $image = $request->input('banner.image', []);
            $banner->image = is_array($image) ? ($image[0] ?? null) : $image;
        }

        $banner->save();

        Toast::info('Banner updated successfully!');
    }

    /**
     * Update banner status
     */
    public function updateStatus(Request $request): void
    {
        $banner = Banner::findOrFail($request->input('id'));
        $banner->status = (int) $request->input('status');
        $banner->save();

        $statusText = $banner->status ? 'Active' : 'Inactive';
        Toast::info("Banner status updated to {$statusText}!");
    }

    /**
     * Delete banner
     */
    public function deleteBanner(Request $request): void
    {
        Banner::findOrFail($request->input('id'))->delete();
        Toast::info('Banner deleted successfully!');
    }
}
