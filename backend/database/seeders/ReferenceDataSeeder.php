<?php

namespace Database\Seeders;

use App\Models\Skill;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Lists every environment needs: GTA neighbourhoods with centroids and the onboarding skill
 * catalogue (decisions D-026, D-027). Keyed upserts, so it is safe to run again (L2-054).
 */
class ReferenceDataSeeder extends Seeder
{
    /**
     * Name, directory area, latitude, longitude. Old City of Toronto neighbourhoods group under
     * "Downtown Toronto", as the directory's counts do; Willowdale groups under North York.
     *
     * @var list<array{string, string, float, float}>
     */
    private const NEIGHBOURHOODS = [
        ['Downtown Toronto', 'Downtown Toronto', 43.653200, -79.383200],
        ['Leslieville', 'Downtown Toronto', 43.662700, -79.333000],
        ['Riverdale', 'Downtown Toronto', 43.669000, -79.349000],
        ['The Danforth', 'Downtown Toronto', 43.678000, -79.348000],
        ['The Annex', 'Downtown Toronto', 43.670000, -79.404000],
        ['Kensington Market', 'Downtown Toronto', 43.654500, -79.400500],
        ['Liberty Village', 'Downtown Toronto', 43.638000, -79.421000],
        ['Roncesvalles', 'Downtown Toronto', 43.646000, -79.449000],
        ['The Junction', 'Downtown Toronto', 43.665500, -79.469000],
        ['North York', 'North York', 43.761500, -79.411100],
        ['Willowdale', 'North York', 43.770000, -79.413000],
        ['Scarborough', 'Scarborough', 43.773100, -79.257800],
        ['Etobicoke', 'Etobicoke', 43.620500, -79.513200],
        ['Mississauga', 'Mississauga', 43.589000, -79.644100],
        ['Brampton', 'Brampton', 43.731500, -79.762400],
        ['Markham', 'Markham', 43.856100, -79.337000],
        ['Vaughan', 'Vaughan', 43.836100, -79.498300],
        ['Richmond Hill', 'Richmond Hill', 43.882800, -79.440300],
        ['Oakville', 'Oakville', 43.467500, -79.687700],
        ['Pickering', 'Pickering', 43.838400, -79.086800],
        ['Ajax', 'Ajax', 43.850900, -79.020400],
    ];

    /** The onboarding catalogue, in the order the skills step shows it. */
    private const CATALOGUE = [
        'React', 'Figma', 'Python', 'Product strategy', 'User research', 'Laravel',
        'Data/ML', 'Marketing', 'Angular', 'Swift', 'Kotlin', 'Fundraising',
    ];

    public function run(): void
    {
        $now = Carbon::now();

        DB::table('neighbourhoods')->upsert(
            array_map(fn (array $n) => [
                'slug' => Str::slug($n[0]),
                'name' => $n[0],
                'area' => $n[1],
                'latitude' => $n[2],
                'longitude' => $n[3],
                'created_at' => $now,
                'updated_at' => $now,
            ], self::NEIGHBOURHOODS),
            ['slug'],
            ['name', 'area', 'latitude', 'longitude', 'updated_at'],
        );

        DB::table('skills')->upsert(
            array_map(fn (string $name, int $i) => [
                'name' => $name,
                'slug' => Str::slug(str_replace('/', ' ', $name)),
                'normalized_name' => Skill::normalize($name),
                'is_catalogue' => true,
                'catalogue_position' => $i + 1,
                'created_at' => $now,
                'updated_at' => $now,
            ], self::CATALOGUE, array_keys(self::CATALOGUE)),
            ['normalized_name'],
            ['name', 'slug', 'is_catalogue', 'catalogue_position', 'updated_at'],
        );
    }
}
