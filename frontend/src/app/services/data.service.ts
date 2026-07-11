import { Injectable, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { analitycsCompanySummary, analitycsDepartmentsData, analitycsfinancialTimeLine, apiAnalyticsUrl } from '../consts/api';
import { CompanySummary, DepartmentsBreakdown, FinancialTimeline } from '../Interfaces/analytics.interface';
@Injectable({
  providedIn: 'root'
})

export class DataService {
    summaryData = httpResource<CompanySummary>(() => `${apiAnalyticsUrl + analitycsCompanySummary}`);
    departments = httpResource<DepartmentsBreakdown[]>(() => `${apiAnalyticsUrl + analitycsDepartmentsData}`);
    financial = httpResource<FinancialTimeline[]>(() => `${apiAnalyticsUrl + analitycsfinancialTimeLine}`)
}