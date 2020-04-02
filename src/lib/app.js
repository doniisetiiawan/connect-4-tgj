import express from 'express';

import config from '../../config';
import { connectMongoDB } from './db';
import parsermfmgj from './parser';
import gamesghcgp from '../routes/games';

const app = express();

app.set('config', config);
connectMongoDB();
parsermfmgj(app);
gamesghcgp(app);

export default app;
