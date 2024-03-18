import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import router from './src/routes/v1/index.js';
import { connDB } from './config/db.config.js';

dotenv.config();
const app = express();
connDB();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', router);

const port = process.env.PORT || 4000;

app.get('/', (req, res) => res.send('<h1>Welcome to EasyExit API<h1>'));
app.listen(port, () =>
    console.log(`🚀 Server running on port http://localhost:${port}/`)
);