import express from 'express';
import requestLib from 'request';
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
    UnsubscribeUrl: string,
    SubscribeURL ?: string
}

/**
 * @description handles sns events subscriptions
 * @param subscribeURL the subscription url of the sns event
 * @param response the express response object
 */
export const handleEventSubscription = async function eventSubscriptionHandler(subscribeURL: string, response: express.Response) {
    try  {
    const awsResponse: any = await requestLib(subscribeURL);
    if(awsResponse.statusCode === 200) {
        return response.status(200).json({
            status: 'success',
            message: 'Confirmation accepted!'
        })
    }
    return response.status(400).json({
        status: 'SNS_EVENT_ERROR',
        message: 'An unknown error occurred. Please check your SNS logs'
    })
    }
    catch(err) {
        return response.status(500).json({
            status: 'SNS_EVENT_ERROR',
            message: err
        });
    }
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
            if(payload.SubscribeURL) {
                return await handleEventSubscription(payload.SubscribeURL, response)
            }
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
        throw err;
    }
};
