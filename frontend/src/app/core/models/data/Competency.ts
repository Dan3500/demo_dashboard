import { TypeModel } from './Type';

export interface CompetencyModel {
  id: number;
  name: string;
  attribute: string;
  weight: number;
  active: boolean;
  level_id: number | null;
  type: TypeModel | null;
}
