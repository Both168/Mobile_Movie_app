<?php

namespace App\Orchid\Screens\Movie;

use Orchid\Screen\Screen;
use Orchid\Screen\Fields\Input;
use Orchid\Support\Facades\Layout;
use Orchid\Screen\Actions\Button;
use Illuminate\Http\Request;
use App\Models\Movie;
use Orchid\Screen\Fields\Select;
use App\Models\Genre;
use Orchid\Screen\Fields\Upload;
use Orchid\Screen\Fields\CheckBox;
use Orchid\Screen\Fields\Group;
use Orchid\Screen\Fields\Switcher;
use Orchid\Support\Facades\Toast;

class CreateMovieScreen extends Screen
{
    /**
     * Fetch data to be displayed on the screen.
     *
     * @return array
     */
    public function query(): iterable
    {
        return [];
    }

    /**
     * The name of the screen displayed in the header.
     *
     * @return string|null
     */
    public function name(): ?string
    {
        return 'Create Movie';
    }

    /**
     * The screen's action buttons.
     *
     * @return \Orchid\Screen\Action[]
     */
    public function commandBar(): iterable
    {
        return [
            Button::make('Save')
                ->icon('bs.save')
                ->method('save'),
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
                        ->help('Only one image is allowed (max 2MB).')
                        ->required(),
                ]),
                Layout::rows([
                    Input::make('movie.video')
                        ->title('Video')
                        ->placeholder('Embed video URL')
                        ->help('Enter the URL of the video you want to embed (Only for Films)')
                        ->id('movie-video-field'),

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
                            '1'     => 'Films',
                            '2'    => 'Series',
                        ])
                        ->empty('Select movie type')
                        ->required()
                        ->id('movie-type-field'),
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
            Layout::view('orchid.Movie.toggle-video-field'),
        ];
    }

    public function save(Request $request)
    {

        $request->validate([
            'movie.image'    => 'required|array|max:1',
            'movie.image.*'  => 'required|integer|exists:attachments,id',
            'movie.video'   => 'nullable|string|required_if:movie.type,1',
        ], [
            'movie.video.required_if' => 'Video is required for Films.',
        ]);
        $movie = new Movie();
        $movie->type = $request->input('movie.type');
        $movie->title = $request->input('movie.title');
        $movie->description = $request->input('movie.description');
        $movie->genre_id = collect($request->input('movie.genre_id', []))->implode(',');
        $movie->age_rating = $request->input('movie.age_rating');
        $movie->language = $request->input('movie.language');
        $image = $request->input('movie.image', []);
        $movie->image = is_array($image) ? ($image[0] ?? null) : $image;
        // Only set video if type is Films (1), otherwise set to null for Series
        if ($request->input('movie.type') == '1') {
            $movie->video = $request->input('movie.video');
        } else {
            $movie->video = null;
        }
        $movie->is_subtitles = $request->input('movie.is_subtitles');
        $movie->is_dubbed = $request->input('movie.is_dubbed');
        $movie->status = $request->input('movie.status');
        $movie->user_id = $request->user()->id;
        $movie->save();

        return redirect()->route('platform.movies');
    }
}
