import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { env } from '../../../env/env';
import { ResponseModel } from '../../models/API/Response';
import { PersonModel } from '../../models/data/Person';

@Injectable({ providedIn: 'root' })
export class PersonService {
  private readonly base = `${env.apiUrl}/data/v1/person`;

  readonly editing = signal<PersonModel | null>(null);
  readonly refreshTrigger = signal(0);

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<ResponseModel<PersonModel[]>> {
    return this.http.get<ResponseModel<PersonModel[]>>(this.base);
  }

  getById(id: number): Observable<ResponseModel<PersonModel>> {
    return this.http.get<ResponseModel<PersonModel>>(`${this.base}/${id}`);
  }

  create(data: Partial<PersonModel>): Observable<ResponseModel<PersonModel>> {
    return this.http.post<ResponseModel<PersonModel>>(this.base, data);
  }

  update(id: number, data: Partial<PersonModel>): Observable<ResponseModel<PersonModel>> {
    return this.http.put<ResponseModel<PersonModel>>(`${this.base}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  setEditing(item: PersonModel): void {
    this.editing.set(item);
  }

  clearEditing(): void {
    this.editing.set(null);
  }

  triggerRefresh(): void {
    this.refreshTrigger.update((v) => v + 1);
  }
}
