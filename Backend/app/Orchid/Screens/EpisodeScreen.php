<?php

namespace App\Orchid\Screens;

use Orchid\Screen\Screen;
use Orchid\Screen\Actions\ModalToggle;
use App\Models\Episode;
use Orchid\Support\Facades\Layout;
use Orchid\Screen\TD;
use Illuminate\Http\Request;
use Orchid\Support\Facades\Toast;
use Orchid\Screen\Fields\Input;
use Orchid\Screen\Fields\TextArea;
use Orchid\Screen\Fields\Upload;
use Orchid\Screen\Actions\Button;
use Orchid\Support\Color;
use Orchid\Screen\Actions\DropDown;
use Orchid\Screen\Fields\ViewField;
use Orchid\Attachment\Models\Attachment;
use Orchid\Screen\Layouts\View;


class EpisodeScreen extends Screen
{
    /**
     * Fetch data to be displayed on the screen.
     *
     * @return array
     */
    public function query(?Episode $episode = null): iterable
    {
        return [
            'episodes' => Episode::filters()
                ->defaultSort('id', 'desc')
                ->paginate(10),
            'episode' => $episode,
        ];
    }

    /**
     * The name of the screen displayed in the header.
     *
     * @return string|null
     */
    public function name(): ?string
    {
        return 'Episode Management';
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
                ->modal('episodeModal')
                ->method('createEpisode')
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
            Layout::table('episodes', [
                TD::make('id')
                    ->sort(),
                TD::make('image', 'Image')
                    ->render(function (Episode $episode) {
                        $attachment = Attachment::find($episode->image);

                        if (! $attachment) {
                            return 'None';
                        }

                        $url = $attachment->url();
                        return "<img src='{$url}' width='40' alt='{$episode->title}' />";
                    }),
                TD::make('title', 'Title')
                    ->sort()
                    ->render(function (Episode $episode) {
                        return $episode->title ?? 'N/A';
                    }),
                TD::make('description', 'Description')
                    ->render(function (Episode $episode) {
                        return $episode->description ? \Illuminate\Support\Str::limit($episode->description, 50) : 'N/A';
                    }),
                TD::make('Actions')
                    ->alignRight()
                    ->render(function (Episode $episode) {
                        $editButton = ModalToggle::make('Edit')
                            ->modal('editEpisodeModal')
                            ->method('updateEpisode')
                            ->icon('bs.pencil')
                            ->type(Color::WARNING())
                            ->asyncParameters([
                                'episode' => $episode->id,
                            ]);
                        $deleteButton = Button::make('Delete')
                            ->confirm('Are you sure you want to delete this episode?')
                            ->icon('bs.trash')
                            ->type(Color::DANGER())
                            ->method('delete', ['id' => $episode->id]);
                        return DropDown::make()
                            ->icon('bs.three-dots-vertical')
                            ->list([
                                $editButton,
                                $deleteButton,
                            ]);
                    }),
            ]),
            //create episode modal layout
            Layout::modal('episodeModal', Layout::rows([
                Input::make('episode.title')
                    ->title('Title')
                    ->placeholder('Title')
                    ->required(),
                ViewField::make('episode_series_custom')->view('orchid.components.episode_series_custom'),
                ViewField::make('episode_season_custom')->view('orchid.components.episode_season_custom'),
                TextArea::make('episode.description')
                    ->title('Description')
                    ->placeholder('Description')
                    ->rows(4),
                Upload::make('episode.image')
                    ->title('Image')
                    ->storage('public')
                    ->disk('public')
                    ->url('/storage/')
                    ->maxFiles(1)
                    ->acceptedFiles('image/*')
                    ->maxFileSize(2)
                    ->help('Only one image is allowed (max 2MB).'),
                Input::make('episode.video')
                    ->title('Video')
                    ->placeholder('Embed video URL')
                    ->help('Enter the URL of the video you want to embed'),
                Input::make('episode.duration')
                    ->type('number')
                    ->title('Duration')
                    ->placeholder('Duration in minutes')
                    ->help('Enter the duration in minutes'),
            ]))
                ->title('Create Episode')
                ->applyButton('Save'),
            Layout::modal('editEpisodeModal', Layout::rows([
                Input::make('episode.title')
                    ->title('Title')
                    ->placeholder('Title')
                    ->required(),
                TextArea::make('episode.description')
                    ->title('Description')
                    ->placeholder('Description')
                    ->rows(4),
                Upload::make('episode.image')
                    ->title('Image')
                    ->storage('public')
                    ->disk('public')
                    ->url('/storage/')
                    ->maxFiles(1)
                    ->acceptedFiles('image/*')
                    ->maxFileSize(2)
                    ->help('Only one image is allowed (max 2MB).'),
                Input::make('episode.video')
                    ->title('Video')
                    ->placeholder('Embed video URL')
                    ->help('Enter the URL of the video you want to embed'),
                Input::make('episode.duration')
                    ->type('number')
                    ->title('Duration')
                    ->placeholder('Duration in minutes')
                    ->help('Enter the duration in minutes'),
            ]))
                ->title('Edit Episode')
                ->applyButton('Update')
                ->deferred('getEpisode'),
        ];
    }

    public function createEpisode(Request $request): void
    {
        $request->validate([
            'episode.title' => 'required',
            'episode.image' => 'nullable|array|max:1',
            'episode.image.*' => 'nullable|integer|exists:attachments,id',
        ]);

        $data = $request->get('episode', []);

        // Ensure $data is an array
        if (!is_array($data)) {
            $data = [];
        }

        // Map 'title' to 'titile' for database (handling the typo)
        if (isset($data['title']) && is_array($data)) {
            $data['titile'] = $data['title'];
            unset($data['title']);
        }

        // Handle image upload (store attachment ID)
        if (is_array($data) && isset($data['image']) && is_array($data['image']) && !empty($data['image'])) {
            $data['image'] = $data['image'][0];
        } else {
            $data['image'] = null;
        }

        Episode::create($data);

        Toast::info('Episode was saved.');
    }

    public function delete(Request $request): void
    {
        $episode = Episode::findOrFail($request->input('id'));
        $episode->delete();

        Toast::info('Episode was deleted.');
    }

    public function getEpisode(Episode $episode): iterable
    {
        // Ensure image is set as array for Upload field
        if ($episode->image) {
            $episode->image = [$episode->image];
        }

        return [
            'episode' => $episode,
        ];
    }

    public function updateEpisode(Request $request, Episode $episode): void
    {
        $request->validate([
            'episode.title' => 'required',
            'episode.image' => 'nullable|array|max:1',
            'episode.image.*' => 'nullable|integer|exists:attachments,id',
        ]);

        // Get data directly from request, excluding image to handle separately
        $data = [];

        if ($request->has('episode.title')) {
            $data['titile'] = $request->input('episode.title');
        }

        if ($request->has('episode.description')) {
            $data['description'] = $request->input('episode.description');
        }

        if ($request->has('episode.video')) {
            $data['video'] = $request->input('episode.video');
        }

        if ($request->has('episode.duration')) {
            $data['duration'] = $request->input('episode.duration');
        }

        // Fill other fields first
        $episode->fill($data);

        // Handle image upload (only update if new image is provided)
        if ($request->has('episode.image') && !empty($request->input('episode.image'))) {
            $image = $request->input('episode.image', []);
            $episode->image = is_array($image) ? ($image[0] ?? null) : $image;
        }

        $episode->save();

        Toast::info('Episode was updated.');
    }
}

