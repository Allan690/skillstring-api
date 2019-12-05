require('./configure-env');

const env = {
    PORT: process.env.APP_PORT || 5000,
    NODE_ENV: process.env.NODE_ENV || 'production',
    REDIS_URL: process.env.REDIS_URL,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_CLIENT_SECRET: process.env.AWS_CLIENT_SECRET,
    DATABASE_URL: process.env.DATABASE_URL
};

export default env;