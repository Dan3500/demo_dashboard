export interface LevelModel {
  id: number;
  name: string;
  description: string;
  percentage: number;
  speciality_id: number | null;
  competency_count: number;
}
