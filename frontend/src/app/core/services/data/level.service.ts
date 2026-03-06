import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { env } from '../../../env/env';
import { ResponseModel } from '../../models/API/Response';
import { LevelModel } from '../../models/data/Level';

@Injectable({ providedIn: 'root' })
export class LevelService {
  private readonly base = `${env.apiUrl}/data/v1/level`;

  readonly editing = signal<LevelModel | null>(null);
  readonly refreshTrigger = signal(0);

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<ResponseModel<LevelModel[]>> {
    return this.http.get<ResponseModel<LevelModel[]>>(this.base);
  }

  getById(id: number): Observable<ResponseModel<LevelModel>> {
    return this.http.get<ResponseModel<LevelModel>>(`${this.base}/${id}`);
  }

  create(data: Partial<LevelModel>): Observable<ResponseModel<LevelModel>> {
    return this.http.post<ResponseModel<LevelModel>>(this.base, data);
  }

  update(id: number, data: Partial<LevelModel>): Observable<ResponseModel<LevelModel>> {
    return this.http.put<ResponseModel<LevelModel>>(`${this.base}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  setEditing(item: LevelModel): void {
    this.editing.set(item);
  }

  clearEditing(): void {
    this.editing.set(null);
  }

  triggerRefresh(): void {
    this.refreshTrigger.update((v) => v + 1);
  }
}
