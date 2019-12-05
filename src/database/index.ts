import mongoose from 'mongoose';
import env from '../config/environment';

const options = {
    poolSize: 10,
    bufferMaxEntries: 0,
    useNewUrlParser: true,
    useUnifiedTopology: true
};

/**
 * Establish database connection
 */
const connectDb = () => mongoose.connect(env.DATABASE_URL, options);

export default connectDb;