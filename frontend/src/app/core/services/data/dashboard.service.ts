import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { env } from '../../../env/env';
import { ResponseModel } from '../../models/API/Response';
import { DashboardStatsModel } from '../../models/data/DashboardStats';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly base = `${env.apiUrl}/data/v1/dashboard`;

  constructor(private readonly http: HttpClient) {}

  getStats(specialityId?: number | null): Observable<ResponseModel<DashboardStatsModel>> {
    const url = specialityId ? `${this.base}?speciality_id=${specialityId}` : this.base;
    return this.http.get<ResponseModel<DashboardStatsModel>>(url);
  }
}
