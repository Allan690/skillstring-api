import debug from 'debug';
import http from 'http';
import env from './config/environment';
import app from './app';
import connectDb from './database';
import { syncWithS3Bucket } from './startupHelper';

const logger = debug('log');
const server = http.createServer(app);

connectDb().then(() => {
    server.listen(env.PORT, async () => {
        app.set('host', `http://localhost:${env.PORT}`);

        logger(`Application running on port ${env.PORT}`);

        syncWithS3Bucket().then(() => {
            logger('Application successfully synced with s3 bucket...')
        }).catch(err => {
            console.error(err)
        });
    });
});
