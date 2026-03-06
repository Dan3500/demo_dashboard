import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { env } from '../../../env/env';
import { ResponseModel } from '../../models/API/Response';
import { TypeModel } from '../../models/data/Type';

@Injectable({ providedIn: 'root' })
export class TypeService {
  private readonly base = `${env.apiUrl}/data/v1/type`;

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<ResponseModel<TypeModel[]>> {
    return this.http.get<ResponseModel<TypeModel[]>>(this.base);
  }

  create(data: Partial<TypeModel>): Observable<ResponseModel<TypeModel>> {
    return this.http.post<ResponseModel<TypeModel>>(this.base, data);
  }

  update(id: number, data: Partial<TypeModel>): Observable<ResponseModel<TypeModel>> {
    return this.http.put<ResponseModel<TypeModel>>(`${this.base}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
