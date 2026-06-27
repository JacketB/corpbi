import { Router } from 'express';
import { db } from '../db/init';

const router = Router();

const BILLING_RATES: Record<string, number> = {
    'Junior': 20,
    'Middle': 35,
    'Senior': 60,
    'Lead': 90,
    'Principal': 120
};

router.get('/company-summary', (req, res) => {
    const from = parseInt(req.query.from as string) || (Date.now() - 30 * 24 * 60 * 60 * 1000);
    const to = parseInt(req.query.to as string) || Date.now();

    try {
        const empMetrics = db.prepare(`
            SELECT em.utilization_rate, em.hours_worked, e.grade
            FROM employee_metrics em
            JOIN employees e ON em.employee_id = e.id
            WHERE em.timestamp >= ? AND em.timestamp <= ? AND e.is_billable = 1
        `).all(from, to) as any[];

        let revenue = 0;
        empMetrics.forEach(metric => {
            const rate = BILLING_RATES[metric.grade] || 25;
            revenue += metric.hours_worked * (metric.utilization_rate / 100) * rate;
        });

        const daysCountResult = db.prepare(`
            SELECT COUNT(DISTINCT timestamp) as days FROM employee_metrics 
            WHERE timestamp >= ? AND timestamp <= ?
        `).get(from, to) as { days: number };
        const days = daysCountResult.days || 1;

        const totalMonthlySalary = (db.prepare('SELECT SUM(salary) as total FROM employees').get() as any).total || 0;
        const salaryExpenses = (totalMonthlySalary / 22) * days;

        const opExpensesResult = db.prepare(`
            SELECT SUM(amount) as total FROM financial_logs 
            WHERE timestamp >= ? AND timestamp <= ? AND type = 'expense'
        `).get(from, to) as { total: number | null };
        const opExpenses = opExpensesResult.total || 0;

        const totalExpenses = salaryExpenses + opExpenses;
        const netProfit = revenue - totalExpenses;
        const margin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

        res.json({
            revenue: parseFloat(revenue.toFixed(2)),
            expenses: parseFloat(totalExpenses.toFixed(2)),
            netProfit: parseFloat(netProfit.toFixed(2)),
            margin: parseFloat(margin.toFixed(2)),
            periodDays: days
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/financial-timeline', (req, res) => {
    const from = parseInt(req.query.from as string) || (Date.now() - 30 * 24 * 60 * 60 * 1000);
    const to = parseInt(req.query.to as string) || Date.now();

    try {
        const dailyRevenue = db.prepare(`
            SELECT em.timestamp, 
                   SUM(em.hours_worked * (em.utilization_rate / 100) * CASE e.grade 
                           WHEN 'Junior' THEN 20 
                           WHEN 'Middle' THEN 35 
                           WHEN 'Senior' THEN 60 
                           WHEN 'Lead' THEN 90 
                           WHEN 'Principal' THEN 120 
                           ELSE 25 
                       END) as revenue
            FROM employee_metrics em
            JOIN employees e ON em.employee_id = e.id
            WHERE em.timestamp >= ? AND em.timestamp <= ?
            GROUP BY em.timestamp
            ORDER BY em.timestamp ASC
        `).all(from, to) as any[];

        const dailyOpExpenses = db.prepare(`
            SELECT timestamp, SUM(amount) as op_expense
            FROM financial_logs
            WHERE timestamp >= ? AND timestamp <= ? AND type = 'expense'
            GROUP BY timestamp
        `).all(from, to) as any[];

        const totalMonthlySalary = (db.prepare('SELECT SUM(salary) as total FROM employees').get() as any).total || 0;
        const dailySalaryExpense = totalMonthlySalary / 22;

        const timeline = dailyRevenue.map(rev => {
            const opExp = dailyOpExpenses.find(ex => ex.timestamp === rev.timestamp)?.op_expense || 0;
            const totalDayExpense = dailySalaryExpense + opExp;
            const profit = rev.revenue - totalDayExpense;

            return {
                timestamp: rev.timestamp,
                date: new Date(rev.timestamp).toISOString().split('T')[0], // Удобно для подписей осей X
                revenue: parseFloat(rev.revenue.toFixed(2)),
                expenses: parseFloat(totalDayExpense.toFixed(2)),
                netProfit: parseFloat(profit.toFixed(2))
            };
        });

        res.json(timeline);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/departments-breakdown', (req, res) => {
    const from = parseInt(req.query.from as string) || (Date.now() - 30 * 24 * 60 * 60 * 1000);
    const to = parseInt(req.query.to as string) || Date.now();

    try {
        const departments = db.prepare('SELECT * FROM departments').all() as any[];
        
        const breakdown = departments.map(dept => {
            const metrics = db.prepare(`
                SELECT em.utilization_rate, em.hours_worked, e.grade, e.salary
                FROM employee_metrics em
                JOIN employees e ON em.employee_id = e.id
                WHERE e.department_id = ? AND em.timestamp >= ? AND em.timestamp <= ?
            `).all(dept.id, from, to) as any[];

            let deptRevenue = 0;
            let avgUtilization = 0;

            const daysCount = db.prepare(`
                SELECT COUNT(DISTINCT em.timestamp) as days 
                FROM employee_metrics em
                JOIN employees e ON em.employee_id = e.id
                WHERE e.department_id = ? AND em.timestamp >= ? AND em.timestamp <= ?
            `).get(dept.id, from, to) as { days: number };
            const periodDays = daysCount.days || 1;

            const deptMonthlyFOT = (db.prepare('SELECT SUM(salary) as total FROM employees WHERE department_id = ?').get(dept.id) as any).total || 0;
            const deptSalaryExpense = (deptMonthlyFOT / 22) * periodDays;

            if (metrics.length > 0) {
                let utilSum = 0;
                metrics.forEach(m => {
                    const rate = BILLING_RATES[m.grade] || 25;
                    deptRevenue += m.hours_worked * (m.utilization_rate / 100) * rate;
                    utilSum += m.utilization_rate;
                });
                avgUtilization = utilSum / metrics.length;
            }

            const deptNetProfit = deptRevenue - deptSalaryExpense;

            return {
                departmentId: dept.id,
                departmentName: dept.name,
                revenue: parseFloat(deptRevenue.toFixed(2)),
                expenses: parseFloat(deptSalaryExpense.toFixed(2)),
                netProfit: parseFloat(deptNetProfit.toFixed(2)),
                avgUtilization: parseFloat(avgUtilization.toFixed(2)),
                employeeCount: 20
            };
        });

        res.json(breakdown);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;