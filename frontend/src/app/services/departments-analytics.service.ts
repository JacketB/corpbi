import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { rxResource } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { analitycsfinancialLogs, apiAnalyticsUrl } from '../consts/api';

export interface FinancialLog {
  department_id: number | null;
  department_name: string;
  timestamp: number;
  category: string;
  type: 'income' | 'expense';
  amount: number;
}

export interface DepartmentChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
  }[];
}

export interface DepartmentAnalyticsResult {
  labels: string[];
  revenueData: { label: string; data: number[] }[];
  expensesData: { label: string; data: number[] }[];
  profitData: { label: string; data: number[] }[];
}

@Injectable({ providedIn: 'root' })
export class DepartmentsAnalyticsService {
  private http = inject(HttpClient);
  
  financialAnalyticsResource = rxResource<DepartmentAnalyticsResult, unknown>({
    stream: () =>
      this.http
        .get<FinancialLog[]>(apiAnalyticsUrl + analitycsfinancialLogs)
        .pipe(map((logs) => this.processLogsForCharts(logs))),
  });

  private processLogsForCharts(logs: FinancialLog[]) {
    const monthsSet = new Set<string>();
    const deptRevenueMap = new Map<string, Record<string, number>>();
    const deptExpensesMap = new Map<string, Record<string, number>>();

    logs.forEach((log) => {
      const month = new Date(log.timestamp).toISOString().slice(0, 7);
      monthsSet.add(month);

      const deptKey = log.department_name 
    ? log.department_name 
    : (log.department_id ? `Dept #${log.department_id}` : 'General / Operations');

      if (!deptRevenueMap.has(deptKey)) deptRevenueMap.set(deptKey, {});
      if (!deptExpensesMap.has(deptKey)) deptExpensesMap.set(deptKey, {});

      const revObj = deptRevenueMap.get(deptKey)!;
      const expObj = deptExpensesMap.get(deptKey)!;

      if (log.type === 'income') {
        revObj[month] = (revObj[month] || 0) + log.amount;
      } else {
        expObj[month] = (expObj[month] || 0) + log.amount;
      }
    });

    const labels = Array.from(monthsSet).sort();

    const createDatasets = (dataMap: Map<string, Record<string, number>>) => {
      return Array.from(dataMap.entries()).map(([deptName, monthValues]) => ({
        label: deptName,
        data: labels.map((m) => monthValues[m] || 0),
      }));
    };

    const profitDatasets = Array.from(
      new Set([...deptRevenueMap.keys(), ...deptExpensesMap.keys()]),
    ).map((deptKey) => {
      const revs = deptRevenueMap.get(deptKey) || {};
      const exps = deptExpensesMap.get(deptKey) || {};
      return {
        label: deptKey,
        data: labels.map((m) => (revs[m] || 0) - (exps[m] || 0)),
      };
    });

    return {
      labels,
      revenueData: createDatasets(deptRevenueMap),
      expensesData: createDatasets(deptExpensesMap),
      profitData: profitDatasets,
    };
  }
}
