<?php

namespace App\Orchid\Screens;

use Orchid\Screen\Screen;
use Orchid\Screen\Actions\ModalToggle;
use App\Models\Season;
use Orchid\Support\Facades\Layout;
use Orchid\Screen\TD;
use Illuminate\Http\Request;
use Orchid\Support\Facades\Toast;
use Orchid\Screen\Fields\Input;
use Orchid\Screen\Fields\TextArea;
use Orchid\Screen\Actions\Button;
use Orchid\Support\Color;
use Orchid\Screen\Actions\DropDown;
use Orchid\Screen\Fields\Select;
use App\Models\Movie;
class SeasonScreen extends Screen
{
    /**
     * Fetch data to be displayed on the screen.
     *
     * @return array
     */
    public function query(?Season $season = null): iterable
    {
        return [
            'seasons' => Season::with('movie')
                ->filters()
                ->defaultSort('id', 'desc')
                ->paginate(10),
            'season' => $season,
        ];
    }

    /**
     * The name of the screen displayed in the header.
     *
     * @return string|null
     */
    public function name(): ?string
    {
        return 'Season Management';
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
                ->modal('seasonModal')
                ->method('createSeason')
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
            Layout::table('seasons', [
                TD::make('id')
                    ->sort(),
                TD::make('title')
                    ->sort(),
                TD::make('description', 'Description')
                    ->sort()
                    ->render(function (Season $season) {
                        return $season->description ? $season->description : 'N/A';
                    }),
                TD::make('movie_id', 'Movie')
                    ->sort()
                    ->render(function (Season $season) {
                        return $season->movie ? $season->movie->title : 'N/A';
                    }),
                TD::make('number_of_season')
                    ->sort(),
                TD::make('Actions')
                    ->alignRight()
                    ->render(function (Season $season) {
                        $editButton = ModalToggle::make('Edit')
                            ->modal('editSeasonModal')
                            ->method('updateSeason')
                            ->icon('bs.pencil')
                            ->type(Color::WARNING())
                            ->asyncParameters([
                                'season' => $season->id,
                            ]);
                        $deleteButton = Button::make('Delete')
                            ->confirm('Are you sure you want to delete this season?')
                            ->icon('bs.trash')
                            ->type(Color::DANGER())
                            ->method('delete', ['id' => $season->id]);
                        return DropDown::make()
                            ->icon('bs.three-dots-vertical')
                            ->list([
                                $editButton,
                                $deleteButton,
                            ]);
                    }),
            ]),
            //create season modal layout
            Layout::modal('seasonModal', Layout::rows([
                Input::make('season.title')
                    ->title('Title')
                    ->placeholder('Title')
                    ->required(),
                TextArea::make('season.description')
                    ->title('Description')
                    ->placeholder('Description')
                    ->rows(4),
                Select::make('season.movie_id')
                    ->title('Movie')
                    ->fromQuery(Movie::where('type', 2)->where('status', 1), 'title', 'id')
                    ->placeholder('Select Series')
                    ->required(),
                Input::make('season.number_of_season')
                    ->title('Number of Season')
                    ->placeholder('Number of Season')
                    ->type('number')
                    ->required(),
            ]))
                ->title('Create Season')
                ->applyButton('Save'),
            //edit season modal layout
            Layout::modal('editSeasonModal',
            Layout::rows([
                Input::make('season.title')
                    ->title('Title')
                    ->placeholder('Title')
                    ->required(),
                TextArea::make('season.description')
                    ->title('Description')
                    ->placeholder('Description')
                    ->rows(4),
                Select::make('season.movie_id')
                    ->title('Movie')
                    ->fromQuery(Movie::where('type', 2)->where('status', 1), 'title', 'id')
                    ->placeholder('Select Series')
                    ->required(),
                Input::make('season.number_of_season')
                    ->title('Number of Season')
                    ->placeholder('Number of Season')
                    ->type('number')
                    ->required(),
            ]))
                ->title('Edit Season')
                ->applyButton('Update')
                ->deferred('getSeason'),
        ];
    }
    public function createSeason(Request $request): void
    {
        $request->validate([
            'season.title' => 'required',
            'season.movie_id' => 'required|exists:movies,id',
            'season.number_of_season' => 'required|integer',
        ]);

        $data = $request->input('season', []);

        if (!is_array($data)) {
            $data = [];
        }

        Season::create($data);

        Toast::info('Season was saved.');
    }

    public function delete(Request $request): void
    {
        $season = Season::findOrFail($request->input('id'));
        $season->delete();

        Toast::info('Season was deleted.');
    }

    public function getSeason(Season $season): iterable
    {
        return [
            'season' => $season,
        ];
    }

    public function updateSeason(Request $request, Season $season): void
    {
        $request->validate([
            'season.title' => 'required',
            'season.movie_id' => 'required|exists:movies,id',
            'season.number_of_season' => 'required|integer',
        ]);

        $data = $request->input('season', []);

        if (!is_array($data)) {
            $data = [];
        }

        $season->fill($data)->save();

        Toast::info('Season was updated.');
    }
}
