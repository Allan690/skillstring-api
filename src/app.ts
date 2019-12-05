import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import routes from '../src/controllers'


const app = express();

app.use(express.json());
app.use(cors());

if (app.get('env') !== 'test') app.use(morgan('dev'));

routes(app);

app.use('*', (req, res) => res.status(404).json({
    message: 'Not Found. Use /api/v1 to access the api'
}));

export default app;
