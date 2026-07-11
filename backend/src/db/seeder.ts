import { db } from './init';

const DEPARTMENTS = [
    'QA Department',
    'Frontend Development',
    'Backend Development',
    'Mobile Team',
    'Design & UX',
    'Management & Operations'
];

const MALE_NAMES = ['Александр', 'Максим', 'Дмитрий', 'Артем', 'Никита', 'Иван', 'Михаил', 'Даниил', 'Егор', 'Андрей'];
const MALE_SURNAMES = ['Иванов', 'Петров', 'Сидоров', 'Ковалев', 'Смирнов', 'Кузнецов', 'Попов', 'Васильев', 'Павлов', 'Дещеня'];
const MALE_PATRONYMICS = ['Александрович', 'Игоревич', 'Сергеевич', 'Николаевич', 'Дмитриевич', 'Семенович', 'Максимович'];

const FEMALE_NAMES = ['Анна', 'Елена', 'Мария', 'Ольга', 'Наталья', 'Екатерина', 'Дарья', 'Ирина', 'Татьяна', 'Анастасия'];
const FEMALE_SURNAMES = ['Иванова', 'Петрова', 'Сидорова', 'Ковалева', 'Смирнова', 'Кузнецова', 'Попова', 'Васильева', 'Павлова', 'Дещеня']; // "Дещеня" не склоняется, оставляем как есть
const FEMALE_PATRONYMICS = ['Александровна', 'Игоревна', 'Сергеевна', 'Николаевна', 'Дмитриевна', 'Семеновна', 'Максимовна'];

function getRandomElement<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateRandomPhone(): string {
    return `+375 (29) ${Math.floor(1000000 + Math.random() * 9000000)}`;
}

export function seedCompanyData() {
    const count = (db.prepare('SELECT COUNT(*) as count FROM departments').get() as any).count;
    if (count > 0) {
        console.log('Database already has company data. Skipping seed.');
        return;
    }

    console.log('Starting data seeding for SoftTeamGlobal...');

    const insertDept = db.prepare('INSERT INTO departments (name) VALUES (?)');
    DEPARTMENTS.forEach(name => insertDept.run(name));

    const departments = db.prepare('SELECT * FROM departments').all() as any[];
    const insertEmployee = db.prepare(`
        INSERT INTO employees (department_id, full_name, phone, hire_date, grade, skills, salary, is_billable)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const grades = ['Junior', 'Middle', 'Senior', 'Lead', 'Principal'];
    const skillsMap: Record<string, string[]> = {
        'QA Department': ['Manual QA', 'Cypress', 'Selenium', 'Postman', 'QA Automation'],
        'Frontend Development': ['Angular', 'TypeScript', 'RxJS', 'React', 'CSS', 'HTML'],
        'Backend Development': ['Node.js', 'NestJS', 'PostgreSQL', 'Docker', 'Go', 'Java'],
        'Mobile Team': ['Flutter', 'React Native', 'Swift', 'Kotlin', 'Dart'],
        'Design & UX': ['Figma', 'UI/UX', 'Prototyping', 'User Research', 'Motion Design'],
        'Management & Operations': ['Jira', 'Agile', 'Scrum', 'Resource Planning', 'Budgeting']
    };

    departments.forEach(dept => {
        const isManagement = dept.name === 'Management & Operations';

        for (let i = 0; i < 20; i++) {
            const isMale = Math.random() > 0.5;
            
            let fullName = '';
            if (isMale) {
                fullName = `${getRandomElement(MALE_SURNAMES)} ${getRandomElement(MALE_NAMES)} ${getRandomElement(MALE_PATRONYMICS)}`;
            } else {
                fullName = `${getRandomElement(FEMALE_SURNAMES)} ${getRandomElement(FEMALE_NAMES)} ${getRandomElement(FEMALE_PATRONYMICS)}`;
            }

            const phone = generateRandomPhone();
            const hireDate = Date.now() - (Math.random() * 3 * 365 * 24 * 60 * 60 * 1000);
            const grade = getRandomElement(grades);
            
            const deptSkills = skillsMap[dept.name] || ['General'];
            const shuffledSkills = [...deptSkills].sort(() => 0.5 - Math.random());
            const skills = shuffledSkills.slice(0, Math.min(3, deptSkills.length)).join(', ');

            let salary = 1500;
            if (grade === 'Middle') salary = 2500;
            if (grade === 'Senior') salary = 4200;
            if (grade === 'Lead') salary = 5500;
            if (grade === 'Principal') salary = 7000;
            salary += Math.floor(Math.random() * 500 - 250);

            const isBillable = isManagement ? 0 : 1;

            insertEmployee.run(dept.id, fullName, phone, hireDate, grade, skills, salary, isBillable);
        }
    });

    console.log('Successfully seeded 6 departments and 120 employees with correct genders.');
    seedHistoricalMetrics();
}

function seedHistoricalMetrics() {
    console.log('Generating historical metrics for the past 180 days...');
    
    const employees = db.prepare('SELECT * FROM employees').all() as any[];
    const insertEmpMetric = db.prepare(`
        INSERT INTO employee_metrics (employee_id, timestamp, utilization_rate, hours_worked)
        VALUES (?, ?, ?, ?)
    `);
    const insertFinLog = db.prepare(`
        INSERT INTO financial_logs (department_id, timestamp, category, type, amount, description)
        VALUES (?, ?, ?, ?, ?, ?)
    `);

    const now = Date.now();
    const oneDayInMs = 24 * 60 * 60 * 1000;

    const runTransaction = db.transaction(() => {
        for (let day = 180; day >= 0; day--) {
            const currentDayTimestamp = now - (day * oneDayInMs);
            const dateObj = new Date(currentDayTimestamp);
            const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;

            if (!isWeekend) {
                employees.forEach(emp => {
                    let utilization = 0;
                    let hoursWorked = 8;

                    if (emp.is_billable === 1) {
                        utilization = 75 + Math.random() * 20;
                        if (emp.department_id === 1 && day > 60 && day < 90) {
                            utilization = 30 + Math.random() * 20;
                        }
                    }

                    insertEmpMetric.run(
                        emp.id, 
                        currentDayTimestamp, 
                        parseFloat(utilization.toFixed(2)), 
                        hoursWorked
                    );
                });
            }

            if (dateObj.getDate() === 1) {
                insertFinLog.run(null, currentDayTimestamp, 'Infrastructure', 'expense', 15000, 'Monthly AWS/Azure cloud cost');
                insertFinLog.run(null, currentDayTimestamp, 'Software Licenses', 'expense', 5000, 'JetBrains, Jira, Slack subscriptions');
                insertFinLog.run(null, currentDayTimestamp, 'Marketing', 'expense', 8000, 'Global marketing campaigns');
            }
        }
    });

    runTransaction();
    console.log('Historical metrics successfully generated.');
}