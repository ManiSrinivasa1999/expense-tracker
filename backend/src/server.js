import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDB } from './config/db.js';
import rateLimiter from './middleware/rateLimiter.js';
import transactionsRoute from './routes/transactionsRoute.js';

const app = express();

app.use(rateLimiter);
app.use(express.json());

dotenv.config();

const PORT = process.env.PORT || 5001;

app.use(cors());

// moved initDB to config/db.js

app.get('/', (req, res) => {
  res.send('Expense Tracker API is running');
});

app.use('/api/transactions', transactionsRoute);

initDB().then(() => {
  app.listen(PORT, () => {
    console.log('Server is running on port ' + PORT);
  });
});
