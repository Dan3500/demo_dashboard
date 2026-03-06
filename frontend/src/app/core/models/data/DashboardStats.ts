export interface LevelStat {
  name: string;
  count: number;
  percentage: number;
}

export interface SpecialityStat {
  id: number;
  name: string;
  count: number;
}

export interface DashboardStatsModel {
  total_persons: number;
  total_specialities: number;
  active_competencies: number;
  avg_compliance: number;
  persons_by_level: LevelStat[];
  persons_by_speciality: SpecialityStat[];
}
