import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { env } from '../../../env/env';
import { ResponseModel } from '../../models/API/Response';
import { SpecialityModel } from '../../models/data/Speciality';

@Injectable({ providedIn: 'root' })
export class SpecialityService {
  private readonly base = `${env.apiUrl}/data/v1/speciality`;

  readonly editing = signal<SpecialityModel | null>(null);
  readonly refreshTrigger = signal(0);

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<ResponseModel<SpecialityModel[]>> {
    return this.http.get<ResponseModel<SpecialityModel[]>>(this.base);
  }

  getById(id: number): Observable<ResponseModel<SpecialityModel>> {
    return this.http.get<ResponseModel<SpecialityModel>>(`${this.base}/${id}`);
  }

  create(data: Partial<SpecialityModel>): Observable<ResponseModel<SpecialityModel>> {
    return this.http.post<ResponseModel<SpecialityModel>>(this.base, data);
  }

  update(id: number, data: Partial<SpecialityModel>): Observable<ResponseModel<SpecialityModel>> {
    return this.http.put<ResponseModel<SpecialityModel>>(`${this.base}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  setEditing(item: SpecialityModel): void {
    this.editing.set(item);
  }

  clearEditing(): void {
    this.editing.set(null);
  }

  triggerRefresh(): void {
    this.refreshTrigger.update((v) => v + 1);
  }
}
