import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(__dirname, '../../monitoring.db');
export const db = new Database(dbPath, { verbose: console.log });

export function initDatabase() {
    db.pragma('foreign_keys = ON');

    db.exec(`
        CREATE TABLE IF NOT EXISTS departments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE
        );
    `);

    db.exec(`
        CREATE TABLE IF NOT EXISTS employees (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            department_id INTEGER NOT NULL,
            full_name TEXT NOT NULL,
            phone TEXT NOT NULL,
            hire_date INTEGER NOT NULL,
            grade TEXT NOT NULL,
            skills TEXT NOT NULL,
            salary REAL NOT NULL,
            is_billable INTEGER DEFAULT 1,
            FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
        );
    `);

    db.exec(`
        CREATE TABLE IF NOT EXISTS employee_metrics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_id INTEGER NOT NULL,
            timestamp INTEGER NOT NULL,
            utilization_rate REAL NOT NULL,
            hours_worked REAL NOT NULL,
            FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
        );
    `);

    db.exec(`
        CREATE TABLE IF NOT EXISTS financial_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            department_id INTEGER, -- Может быть NULL, если это общекорпоративный расход
            timestamp INTEGER NOT NULL,
            category TEXT NOT NULL,
            type TEXT NOT NULL,    -- 'income' (доход) или 'expense' (расход)
            amount REAL NOT NULL,
            description TEXT,
            FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
        );
    `);

    db.exec(`CREATE INDEX IF NOT EXISTS idx_emp_dept ON employees(department_id);`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_metrics_emp_time ON employee_metrics(employee_id, timestamp);`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_fin_time ON financial_logs(timestamp);`);

    console.log('Database tables and indexes initialized successfully.');
}