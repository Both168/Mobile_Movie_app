<?php

namespace App\Orchid\Screens;

use Orchid\Screen\Screen;
use Orchid\Screen\Fields\Input;
use Orchid\Support\Facades\Layout;
use Orchid\Screen\Actions\ModalToggle;
use Illuminate\Http\Request;
use App\Models\Genre;
use Orchid\Support\Facades\Toast;
use Orchid\Screen\TD;
use Orchid\Screen\Actions\Button;
use Orchid\Support\Color;

class GenreScreen extends Screen
{
    /**
     * Fetch data to be displayed on the screen.
     *
     * @return array
     */
    public function query(?Genre $genre = null): iterable
    {
        return [
            'genres' => Genre::filters()
                ->defaultSort('id', 'desc')
                ->paginate(10),
            'genre' => $genre,
        ];
    }

    /**
     * The name of the screen displayed in the header.
     *
     * @return string|null
     */
    public function name(): ?string
    {
        return 'Genres Management';
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
                ->modal('genreModal')
                ->method('createGenre')
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
            //list display layout
            Layout::table('genres', [
                TD::make('id')
                    ->sort(),
                TD::make('name')
                    ->sort()
                    ->filter(Input::make()),
                TD::make('Actions')
                    ->alignRight()
                    ->render(function (Genre $genre) {
                        $editButton = ModalToggle::make('Edit')
                            ->modal('editGenreModal')
                            ->method('updateGenre')
                            ->icon('bs.pencil')
                            ->type(Color::WARNING())
                            ->asyncParameters([
                                'genre' => $genre->id,
                            ]);

                        $deleteButton = Button::make('Delete')
                            ->confirm('Are you sure you want to delete this genre?')
                            ->icon('bs.trash')
                            ->type(Color::DANGER())
                            ->method('deleteGenre', ['id' => $genre->id]);

                        return view('orchid.Genre.genre-actions', [
                            'editButton' => $editButton,
                            'deleteButton' => $deleteButton,
                        ]);
                    }),
            ]),

            //create genre modal layout
            Layout::modal('genreModal', Layout::rows([
                Input::make('genre.name')
                    ->title('Name')
                    ->placeholder('Name')
                    ->required(),
            ]))
                ->title('Create Genre')
                ->applyButton('Save'),

            //edit modal layout
            Layout::modal('editGenreModal', Layout::rows([
                Input::make('genre.name')
                    ->title('Name')
                    ->placeholder('Name')
                    ->required(),
            ]))
                ->title('Edit Genre')
                ->applyButton('Update')
                ->deferred('getGenre'),
        ];
    }

    //create
    public function createGenre(Request $request)
    {
        $request->validate([
            'genre.name' => 'required|unique:genres,name',
        ], [
            'genre.name.unique' => 'Genre name already exists.',
        ]);

        $genre = new Genre();
        $genre->name = $request->input('genre.name');
        $genre->save();

        return redirect()->route('platform.genre');
    }

    /**
     * Delete genre
     *
     * @param Request $request
     * @return void
     */
    public function deleteGenre(Request $request): void
    {
        Genre::findOrFail($request->input('id'))->delete();

        Toast::info('Genre deleted successfully!');
    }

    //load Genre
    public function getGenre(Genre $genre): iterable
    {
        return [
            'genre' => $genre,
        ];
    }

    public function updateGenre(Request $request, Genre $genre): void
    {
        $request->validate([
            'genre.name' => 'required|unique:genres,name,' . $genre->id,
        ], [
            'genre.name.unique' => 'Genre name already exists.',
        ]);

        $genre->name = $request->input('genre.name');
        $genre->save();

        Toast::info('Genre updated successfully!');
    }

}
