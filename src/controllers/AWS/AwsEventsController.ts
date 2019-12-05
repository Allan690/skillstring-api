import express from 'express';
import { parse } from 'path';
import {getAllPdfObjects, removeDocument, saveFilteredObjects} from "../../services/Documents/DocumentService";

interface awsPayload {
    Type: string,
    MessageId: string,
    TopicArn: string,
    Subject: string,
    Message: string,
    Timestamp: string,
    SignatureVersion: string,
    Signature: string,
    SigningCerURL: string,
    UnsubscribeUrl: string
}

/**
 * @description synchronizes pdf files in database with aws bucket
 * @param request
 * @param response
 */
export const handleAwsEvents = async function awsEventsHandler(request: express.Request, response: express.Response) {
    try {
        let body = '';
        request.on('data', (chunk) => {
            body += chunk.toString()
        });
        request.on('end', async () => {
            let payload: awsPayload = JSON.parse(body);
            const { Message } = payload;
            const parsedMessage = JSON.parse(Message);
            const { s3: { object: { key, eTag } }, eventName } = parsedMessage.Records[0];
            const { base:name, dir } = parse(key);
            let creator = dir === '' ? 'root': dir;
            if(eventName === 'ObjectCreated:Put') {
                await saveFilteredObjects(name, eTag, creator);
            }
            if(eventName === 'ObjectRemoved:DeleteMarkerCreated') {
                await removeDocument(creator, name);
            }
            await getAllPdfObjects('skillstring-file-converter', 20);
        });
    }
    catch(err) {
        console.log(err);
        throw err;
    }
};


