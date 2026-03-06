import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { env } from '../../../env/env';
import { ResponseModel } from '../../models/API/Response';
import { CompetencyModel } from '../../models/data/Competency';

@Injectable({ providedIn: 'root' })
export class CompetencyService {
  private readonly base = `${env.apiUrl}/data/v1/competency`;

  /** Item que se está editando. null = modo creación */
  readonly editing = signal<CompetencyModel | null>(null);

  /** Signal que se incrementa para forzar recarga en el data-table */
  readonly refreshTrigger = signal(0);

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<ResponseModel<CompetencyModel[]>> {
    return this.http.get<ResponseModel<CompetencyModel[]>>(this.base);
  }

  getById(id: number): Observable<ResponseModel<CompetencyModel>> {
    return this.http.get<ResponseModel<CompetencyModel>>(`${this.base}/${id}`);
  }

  create(data: Partial<CompetencyModel> & { type_id?: number | null }): Observable<ResponseModel<CompetencyModel>> {
    return this.http.post<ResponseModel<CompetencyModel>>(this.base, data);
  }

  update(id: number, data: Partial<CompetencyModel> & { type_id?: number | null }): Observable<ResponseModel<CompetencyModel>> {
    return this.http.put<ResponseModel<CompetencyModel>>(`${this.base}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  setEditing(item: CompetencyModel): void {
    this.editing.set(item);
  }

  clearEditing(): void {
    this.editing.set(null);
  }

  triggerRefresh(): void {
    this.refreshTrigger.update((v) => v + 1);
  }
}
