<?php

namespace App\Services\Profiles;

use App\Models\Skill;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

/** The skills members choose from, and the custom skills they add (L2-006, L2-007). */
class SkillCatalogue
{
    /** @return Collection<int, Skill> */
    public function catalogue(): Collection
    {
        return Skill::catalogue()->get();
    }

    /**
     * Turns `{id}` (a catalogue skill) and `{name}` (any skill) entries into skills, in order,
     * dropping repeats however they are written; custom names are found or created.
     *
     * @param  list<array{id?: int|null, name?: string|null}>  $entries
     * @return list<int> skill ids in the member's order
     */
    public function resolve(array $entries): array
    {
        $ids = [];
        foreach ($entries as $entry) {
            if (! empty($entry['id'])) {
                $ids[] = (int) $entry['id'];

                continue;
            }
            $name = trim((string) ($entry['name'] ?? ''));
            $normalized = Skill::normalize($name);
            $ids[] = Skill::firstOrCreate(
                ['normalized_name' => $normalized],
                ['name' => $name, 'slug' => $this->uniqueSlug($name)],
            )->id;
        }

        return array_values(array_unique($ids));
    }

    private function uniqueSlug(string $name): string
    {
        $base = Str::slug(str_replace('/', ' ', $name)) ?: 'skill';
        $slug = $base;
        for ($i = 2; Skill::where('slug', $slug)->exists(); $i++) {
            $slug = "{$base}-{$i}";
        }

        return $slug;
    }
}
