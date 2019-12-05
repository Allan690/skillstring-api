import aws from 'aws-sdk';
import env from './environment';

const s3 = new aws.S3({
    region: 'eu-west-2',
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_CLIENT_SECRET,
});

export default s3;
