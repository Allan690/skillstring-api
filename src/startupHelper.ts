import request from 'request';

/**
 * @description runs sync with s3 bucket at startup
 */
export const syncWithS3Bucket = async function syncWithS3Bucket() {
    try {
    const documents = await request('http://localhost:5000/api/v1/documents?bucket=skillstring-file-converter&maxKeys=100');
    return documents;
    }
    catch(err) {
        console.error(err);
    }
};
