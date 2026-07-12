import { Injectable, Signal, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { analitycsCompanySummary, analitycsDepartmentsData, analitycsEmployees, analitycsfinancialTimeLine, apiAnalyticsUrl } from '../consts/api';
import { CompanySummary, DepartmentsBreakdown, Employee, FinancialTimeline } from '../Interfaces/analytics.interface';
@Injectable({
  providedIn: 'root'
})

export class DataService {
    summaryData = httpResource<CompanySummary>(() => `${apiAnalyticsUrl + analitycsCompanySummary}`);
    departments = httpResource<DepartmentsBreakdown[]>(() => `${apiAnalyticsUrl + analitycsDepartmentsData}`);
    financial = httpResource<FinancialTimeline[]>(() => `${apiAnalyticsUrl + analitycsfinancialTimeLine}`)

    getEmployeesByDepartment(departmentId: Signal<string> | string) {
    return httpResource<Employee[]>(() => {
      const id = typeof departmentId === 'function' ? departmentId() : departmentId;
      return `${apiAnalyticsUrl+analitycsEmployees}?department_id=${id}`;
    });
  }
}