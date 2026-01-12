<?php

namespace App\Orchid\Screens\Movie;

use App\Models\Genre;
use App\Models\Movie;
use App\Models\User;
use Orchid\Attachment\Models\Attachment;
use Orchid\Screen\Actions\Link;
use Orchid\Screen\Actions\Button;
use Orchid\Screen\Actions\ModalToggle;
use Orchid\Screen\Fields\Input;
use Orchid\Screen\Fields\Select;
use Orchid\Screen\Fields\Upload;
use Orchid\Screen\Fields\CheckBox;
use Orchid\Screen\Fields\Group;
use Orchid\Screen\Fields\Switcher;
use Orchid\Screen\Screen;
use Orchid\Screen\TD;
use Orchid\Support\Facades\Layout;
use Orchid\Support\Facades\Toast;
use Illuminate\Http\Request;
use Orchid\Support\Color;

class MovieScreen extends Screen
{
    /**
     * Fetch data to be displayed on the screen.
     *
     * @return array
     */
    public function query(?Movie $movie = null): iterable
    {
        return [
            'movies' => Movie::filters()->defaultSort('id', 'desc')->paginate(10),
            'movie' => $movie,
        ];
    }

    /**
     * The name of the screen displayed in the header.
     *
     * @return string|null
     */
    public function name(): ?string
    {
        return 'Movies Management';
    }

    /**
     * The screen's action buttons.
     *
     * @return \Orchid\Screen\Action[]
     */
    public function commandBar(): iterable
    {
        return [
            Link::make('Create')
                ->route('platform.movies.create')
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
            Layout::table('movies', [
                TD::make('id')
                    ->sort()
                    ->filter(Input::make()),
                TD::make('image', 'Image')
                    ->render(function (Movie $movie) {
                        $attachment = Attachment::find($movie->image);

                        if (! $attachment) {
                            return 'None';
                        }

                        $url = $attachment->url();
                        return "<img src='{$url}' width='40' alt='{$movie->title}' />";
                    }),
                TD::make('title')
                    ->sort()
                    ->filter(Input::make()),
                TD::make('type', 'Type')
                    ->sort()
                    ->filter(
                        Select::make()
                            ->empty('All types')
                            ->options([
                                '1' => 'Films',
                                '2' => 'Series',
                            ])
                    )
                    ->render(function (Movie $movie) {
                        $typeText = $movie->type == 1 ? 'Films' : ($movie->type == 2 ? 'Series' : '—');
                        $badgeColor = $movie->type == 1 ? 'info' : 'primary';
                        return "<span class='badge bg-{$badgeColor}' style='border-radius:0.2rem;'>{$typeText}</span>";
                    }),
                TD::make('genre_id', 'Genre')
                    ->sort()
                    ->filter(
                        Select::make()
                            ->empty('All genres')
                            ->options(
                                Genre::orderBy('name')->pluck('name', 'id')->toArray()
                            )
                    )
                    ->render(function (Movie $movie) {
                        $names = $movie->genre_names;

                        if (empty($names)) {
                            return '—';
                        }

                        $bgClasses = ['warning'];

                        $badges = collect($names)->map(function ($name) use ($bgClasses) {
                            $class = $bgClasses[array_rand($bgClasses)];

                            return "<span class='badge bg-{$class}' style='margin-right:4px; border-radius:0.2rem;'>{$name}</span>";
                        })->implode('');

                        return $badges;
                    }),
                TD::make('language')
                    ->sort()
                    ->filter(
                        Select::make()
                        ->empty('All languages')
                        ->options([
                            'en' => 'English',
                            'fr' => 'French',
                            'es' => 'Spanish',
                            'de' => 'German',
                            'it' => 'Italian',
                            'pt' => 'Portuguese',
                            'ru' => 'Russian',
                            'zh' => 'Chinese',
                            'ja' => 'Japanese',
                            'ko' => 'Korean',
                    ]))
                    ->render(function (Movie $movie) {
                        $languages = [
                            'en' => 'English',
                            'fr' => 'French',
                            'es' => 'Spanish',
                            'de' => 'German',
                            'it' => 'Italian',
                            'pt' => 'Portuguese',
                            'ru' => 'Russian',
                            'zh' => 'Chinese',
                            'ja' => 'Japanese',
                            'ko' => 'Korean',
                        ];

                        return $languages[$movie->language] ?? $movie->language;
                    }),
                TD::make('age_rating', 'Age Rating')
                    ->sort()
                    ->filter(Input::make()),
                TD::make('is_subtitles', 'Subtitles')
                    ->render(fn (Movie $movie) => $movie->is_subtitles ? 'Yes' : 'No'),
                TD::make('is_dubbed', 'Dubbed')
                    ->render(fn (Movie $movie) => $movie->is_dubbed ? 'Yes' : 'No'),
                TD::make('user_id', 'Uploader')
                    ->sort()
                    ->filter(
                        Select::make()
                            ->empty('All uploaders')
                            ->options(
                                User::orderBy('name')->pluck('name', 'id')->toArray()
                            )
                    )
                    ->render(function (Movie $movie) {
                        if (!$movie->user_id) {
                            return '—';
                        }
                        $user = User::find($movie->user_id);
                        return $user ? $user->name : '—';
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
                    ->render(function (Movie $movie) {
                        $statusText = $movie->status ? 'Active' : 'Inactive';
                        $newStatus = $movie->status ? 0 : 1;
                        $newStatusText = $newStatus ? 'Active' : 'Inactive';

                        return Button::make($statusText)
                            ->method('updateStatus', [
                                'id' => $movie->id,
                                'status' => $newStatus,
                            ])
                            ->type($movie->status ? Color::SUCCESS() : Color::DANGER())
                            ->icon($movie->status ? 'bs.check-circle' : 'bs.x-circle')
                            ->style('border-radius: 0.25rem;');
                    }),
                TD::make('created_at', 'Created')
                    ->sort()
                    ->render(fn (Movie $movie) => $movie->created_at ? $movie->created_at->format('Y-m-d') : '—'),
                TD::make('Actions')
                    ->alignRight()
                    ->render(function (Movie $movie) {
                        $editButton = ModalToggle::make('Edit')
                            ->modal('editMovieModal')
                            ->method('updateMovie')
                            ->icon('bs.pencil')
                            ->type(Color::WARNING())
                            ->asyncParameters([
                                'movie' => $movie->id,
                            ]);

                        $deleteButton = Button::make('Delete')
                            ->confirm('Are you sure you want to delete this movie?')
                            ->icon('bs.trash')
                            ->type(Color::DANGER())
                            ->method('deleteMovie', ['id' => $movie->id]);

                        return view('orchid.Movie.movie-action', [
                            'editButton' => $editButton,
                            'deleteButton' => $deleteButton,
                        ]);
                    }),
            ]),
            //edit layout
            Layout::modal('editMovieModal', [
                Layout::columns([
                    Layout::rows([
                        Upload::make('movie.image')
                            ->title('Image')
                            ->storage('public')
                            ->disk('public')
                            ->url('/storage/')
                            ->maxFiles(1)
                            ->acceptedFiles('image/*')
                            ->maxFileSize(2)
                            ->help('Only one image is allowed (max 2MB).'),
                    ]),
                    Layout::rows([
                        Input::make('movie.video')
                            ->title('Video')
                            ->placeholder('Embed video URL')
                            ->help('Enter the URL of the video you want to embed (Only for Films)')
                            ->id('movie-video-field-edit'),

                        Group::make([
                            CheckBox::make('movie.is_subtitles')
                                ->title('Subtitles')
                                ->sendTrueOrFalse(),
                            CheckBox::make('movie.is_dubbed')
                                ->title('Dubbed')
                                ->sendTrueOrFalse(),
                            Switcher::make('movie.status')
                                ->title('Active')
                                ->sendTrueOrFalse(),
                        ])->autoWidth(),
                    ]),
                ]),
                Layout::columns([
                    Layout::rows([
                        Select::make('movie.type')
                            ->title('Type')
                            ->options([
                                '1' => 'Films',
                                '2' => 'Series',
                            ])
                            ->empty('Select movie type')
                            ->required()
                            ->id('movie-type-field-edit'),
                    ]),
                    Layout::rows([
                        Input::make('movie.title')
                            ->title('Title')
                            ->placeholder('Title')
                            ->required(),
                    ]),
                    Layout::rows([
                        Input::make('movie.description')
                            ->title('Description')
                            ->placeholder('Description')
                            ->required(),
                    ]),
                ]),
                Layout::columns([
                    Layout::rows([
                        Select::make('movie.genre_id')
                            ->title('Genre')
                            ->fromModel(Genre::class, 'name')
                            ->multiple()
                            ->placeholder('Select genres')
                            ->required(),
                    ]),
                    Layout::rows([
                        Input::make('movie.age_rating')
                            ->title('Age Rating')
                            ->placeholder('Age Rating')
                            ->type('number')
                            ->required(),
                    ]),
                    Layout::rows([
                        Select::make('movie.language')
                            ->title('Language')
                            ->options([
                                'en' => 'English',
                                'fr' => 'French',
                                'es' => 'Spanish',
                                'de' => 'German',
                                'it' => 'Italian',
                                'pt' => 'Portuguese',
                                'ru' => 'Russian',
                                'zh' => 'Chinese',
                                'ja' => 'Japanese',
                                'ko' => 'Korean',
                            ])
                            ->required(),
                    ]),
                ]),
            ])
                ->title('Edit Movie')
                ->applyButton('Update')
                ->deferred('getMovie'),
            Layout::view('orchid.Movie.toggle-video-field-edit'),
        ];
    }

    /**
     * Update movie status
     */
    public function updateStatus(Request $request): void
    {
        $movie = Movie::findOrFail($request->input('id'));
        $movie->status = (int) $request->input('status');
        $movie->save();

        $statusText = $movie->status ? 'Active' : 'Inactive';
        Toast::info("Movie status updated to {$statusText}!");
    }

    /**
     * Get movie for editing
     */
    public function getMovie(Movie $movie): iterable
    {
        // Convert comma-separated genre_id string to array for multiple select
        $genreIds = $movie->genre_id ? explode(',', $movie->genre_id) : [];
        $movie->genre_id = array_filter(array_map('intval', $genreIds));

        // Ensure image is set as array for Upload field
        if ($movie->image) {
            $movie->image = [$movie->image];
        }

        return [
            'movie' => $movie,
        ];
    }

    /**
     * Update movie
     */
    public function updateMovie(Request $request, Movie $movie): void
    {
        $movie->type = $request->input('movie.type');
        $movie->title = $request->input('movie.title');
        $movie->description = $request->input('movie.description');
        $movie->genre_id = collect($request->input('movie.genre_id', []))->implode(',');
        $movie->age_rating = $request->input('movie.age_rating');
        $movie->language = $request->input('movie.language');

        // Handle image upload (only update if new image is provided)
        if ($request->has('movie.image') && !empty($request->input('movie.image'))) {
            $image = $request->input('movie.image', []);
            $movie->image = is_array($image) ? ($image[0] ?? null) : $image;
        }

        // Only set video if type is Films (1), otherwise set to null for Series
        if ($request->input('movie.type') == '1') {
            $movie->video = $request->input('movie.video');
        } else {
            $movie->video = null;
        }
        $movie->is_subtitles = $request->input('movie.is_subtitles', false);
        $movie->is_dubbed = $request->input('movie.is_dubbed', false);
        $movie->status = $request->input('movie.status', false);
        $movie->save();

        Toast::info('Movie updated successfully!');
    }
    public function deleteMovie(Request $request): void
    {
        Movie::findOrFail($request->input('id'))->delete();

        Toast::info('Movie deleted successfully!');
    }
}
