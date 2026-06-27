import express from 'express';
import cors from 'cors';
import { initDatabase } from './db/init';
import { seedCompanyData } from './db/seeder';
import analyticsRouter from './routes/analitycs';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

initDatabase();
seedCompanyData();

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', company: 'SoftTeamGlobal Backend API ready' });
});

app.use('/api/analytics', analyticsRouter);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});