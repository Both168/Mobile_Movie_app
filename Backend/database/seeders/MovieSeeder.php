<?php

namespace Database\Seeders;

use App\Models\Movie;
use App\Models\Genre;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Faker\Factory as Faker;

class MovieSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create();

        // Get existing genres and users
        $genres = Genre::pluck('id')->toArray();
        $users = User::pluck('id')->toArray();

        // If no genres exist, create some
        if (empty($genres)) {
            $genres = [];
            $genreNames = ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Romance', 'Thriller'];
            foreach ($genreNames as $name) {
                $genre = Genre::create(['name' => $name]);
                $genres[] = $genre->id;
            }
        }

        // If no users exist, use a default user ID (1)
        if (empty($users)) {
            $users = [1];
        }

        // Movie titles
        $movieTitles = [
            'The Dark Knight Returns',
            'Inception: The Final Chapter',
            'Interstellar Journey',
            'Blade Runner 2049',
            'The Matrix Reloaded',
            'Pirates of the Caribbean',
            'Fast & Furious 10',
            'The Avengers: Endgame',
            'Spider-Man: No Way Home',
            'Dune: Part Two',
            'Black Panther: Wakanda Forever',
            'Top Gun: Maverick',
            'Avatar: The Way of Water',
            'Doctor Strange: Multiverse',
            'Guardians of the Galaxy Vol. 3',
        ];

        // Languages
        $languages = ['English', 'Spanish', 'French', 'Japanese', 'Korean', 'Chinese'];

        // Age ratings
        $ageRatings = [13, 16, 18, 21];

        // Create 15 movies
        for ($i = 0; $i < 15; $i++) {
            // Create a fake image attachment using picsum.photos
            $seed = $i + 100;
            $imageUrl = "https://picsum.photos/seed/{$seed}/300/450";

            // Create attachment record for the image
            $attachmentId = DB::table('attachments')->insertGetId([
                'name' => 'movie_' . ($i + 1) . '.jpg',
                'original_name' => 'movie_' . ($i + 1) . '.jpg',
                'mime' => 'image/jpeg',
                'extension' => 'jpg',
                'size' => rand(50000, 500000),
                'sort' => 0,
                'path' => $imageUrl, // Store external URL as path for simplicity
                'description' => null,
                'alt' => $movieTitles[$i] ?? 'Movie Image',
                'hash' => md5('movie_' . ($i + 1) . time()),
                'disk' => 'public',
                'user_id' => $users[array_rand($users)] ?? null,
                'group' => 'movies',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $movie = Movie::create([
                'type' => $faker->randomElement([1, 2]), // 1 = Film, 2 = Series
                'title' => $movieTitles[$i] ?? $faker->sentence(3),
                'description' => $faker->paragraph(3),
                'image' => $attachmentId,
                'video' => 'https://www.youtube.com/watch?v=' . $faker->regexify('[A-Za-z0-9]{11}'),
                'genre_id' => $genres ? implode(',', [$genres[array_rand($genres)]]) : null,
                'age_rating' => $ageRatings[array_rand($ageRatings)],
                'language' => $languages[array_rand($languages)],
                'is_subtitles' => $faker->boolean(70) ? 1 : 0,
                'is_dubbed' => $faker->boolean(50) ? 1 : 0,
                'status' => 1,
                'user_id' => $users[array_rand($users)] ?? null,
                'created_at' => now()->subDays(rand(1, 30)),
                'updated_at' => now()->subHours(rand(0, 48)),
            ]);

            $this->command->info("Created movie: {$movie->title}");
        }

        $this->command->info('Successfully created 15 movies!');
    }
}

