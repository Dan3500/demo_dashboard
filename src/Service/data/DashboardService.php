<?php

namespace App\Service\data;

use App\Repository\data\CompetencyRepository;
use App\Repository\data\PersonRepository;
use App\Repository\data\SpecialityRepository;

class DashboardService
{
    public function __construct(
        private readonly SpecialityRepository $specialityRepo,
        private readonly PersonRepository     $personRepo,
        private readonly CompetencyRepository $competencyRepo,
    ) {}

    public function getStats(?int $specialityId): array
    {
        // Solo consideramos especialidades activas
        $specialities = array_filter($this->specialityRepo->findAll(), fn($s) => $s->isActive());

        // Mapas auxiliares: nivel → id de especialidad, nivel → porcentaje requerido
        [$levelSpecMap, $levelPctMap] = $this->buildLevelMaps($specialities);

        // Filtramos personas y competencias a los niveles de especialidades activas
        $filteredPersons      = $this->filterByLevel($this->personRepo->findAll(),      $specialityId, $levelSpecMap);
        $filteredCompetencies = $this->filterByLevel($this->competencyRepo->findAll(),  $specialityId, $levelSpecMap);
        $activeCompetencies   = array_filter($filteredCompetencies, fn($c) => $c->isActive());

        return [
            'total_persons'         => count($filteredPersons),
            'total_specialities'    => count($specialities),
            'active_competencies'   => count($activeCompetencies),
            'avg_compliance'        => $this->calcAvgCompliance($filteredPersons, $levelPctMap),
            'persons_by_level'      => $this->groupByLevel($filteredPersons, $levelPctMap),
            'persons_by_speciality' => $this->groupBySpeciality($filteredPersons, $levelSpecMap),
        ];
    }

    /**
     * Construye dos mapas indexados por ID de nivel:
     *  - $levelSpecMap: nivel → ID de especialidad
     *  - $levelPctMap:  nivel → porcentaje requerido
     *
     * @return array{array<int,int>, array<int,int>}
     */
    private function buildLevelMaps(array $specialities): array
    {
        $levelSpecMap = [];
        $levelPctMap  = [];

        foreach ($specialities as $spec) {
            foreach ($spec->getLevels() as $level) {
                $levelSpecMap[$level->getId()] = $spec->getId();
                $levelPctMap[$level->getId()]  = $level->getPercentage() ?? 0;
            }
        }

        return [$levelSpecMap, $levelPctMap];
    }

    /**
     * Filtra cualquier colección de entidades que expongan getLevel().
     * Conserva solo las que pertenezcan a un nivel de una especialidad activa y,
     * opcionalmente, a una especialidad concreta.
     */
    private function filterByLevel(array $entities, ?int $specialityId, array $levelSpecMap): array
    {
        return array_filter($entities, function ($entity) use ($specialityId, $levelSpecMap): bool {
            $levelId = $entity->getLevel()?->getId();
            if ($levelId === null || !array_key_exists($levelId, $levelSpecMap)) return false;
            return $specialityId === null || $levelSpecMap[$levelId] === $specialityId;
        });
    }

    /**
     * Calcula el porcentaje medio de cumplimiento:
     * media del porcentaje del nivel asignado a cada persona.
     */
    private function calcAvgCompliance(array $persons, array $levelPctMap): int
    {
        $percentages = array_map(fn($p) => $levelPctMap[$p->getLevel()?->getId()] ?? 0, $persons);

        return count($percentages) > 0
            ? (int) round(array_sum($percentages) / count($percentages))
            : 0;
    }

    /**
     * Agrupa personas por nivel, ordenadas por porcentaje ascendente.
     *
     * @return list<array{name: string, count: int, percentage: int}>
     */
    private function groupByLevel(array $persons, array $levelPctMap): array
    {
        $groups = [];

        foreach ($persons as $person) {
            $level = $person->getLevel();
            if (!$level) continue;

            $levelId = $level->getId();

            if (!isset($groups[$levelId])) {
                $groups[$levelId] = [
                    'name'       => $level->getName(),
                    'count'      => 0,
                    'percentage' => $levelPctMap[$levelId] ?? 0,
                ];
            }
            $groups[$levelId]['count']++;
        }

        usort($groups, fn($a, $b) => $a['percentage'] <=> $b['percentage']);

        return array_values($groups);
    }

    /**
     * Agrupa personas por especialidad (para el gráfico de donut).
     *
     * @return list<array{id: int, name: string, count: int}>
     */
    private function groupBySpeciality(array $persons, array $levelSpecMap): array
    {
        $groups = [];

        foreach ($persons as $person) {
            $level  = $person->getLevel();
            if (!$level) continue;

            $specId = $levelSpecMap[$level->getId()] ?? null;
            if (!$specId) continue;

            if (!isset($groups[$specId])) {
                $groups[$specId] = [
                    'id'    => $specId,
                    'name'  => $level->getSpeciality()?->getName() ?? 'Sin especialidad',
                    'count' => 0,
                ];
            }
            $groups[$specId]['count']++;
        }

        return array_values($groups);
    }
}
