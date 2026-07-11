export interface CompanySummary {
  revenue: number;
  expenses: number;
  netProfit: number;
  margin: number;
  periodDays: number;
}

export interface FinancialTimeline {
  timestamp: number;
  date: string;
  revenue: number;
  expenses: number;
  netProfit: number;
}

export interface DepartmentsBreakdown {
    departmentId: number,
    departmentName: string,
    revenue: number,
    expenses: number,
    netProfit: number,
    avgUtilization: number,
    employeeCount: number
}