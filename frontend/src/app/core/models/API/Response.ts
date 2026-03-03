import { ErrorModel } from './Error';

export interface ResponseModel<T = unknown> {
  success: boolean;
  data?: T;
  error?: ErrorModel;
}
