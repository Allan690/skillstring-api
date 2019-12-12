import express from 'express';
import { parse } from 'path';
import env from "../../config/environment";
import cache from "../../cache";
import { cacheKey, getAllPdfObjects, saveFilteredObjects, removeDocument } from '../../services/Documents/DocumentService';

/**
 * @description fetches all pdf documents from AWS bucket
 * @param request
 * @param response
 */
export const getAllDocuments = async function getAllDocuments(request: express.Request, response: express.Response) {
    try {
        const { bucket, maxKeys } = request.query;
        const pdfObjects = await cache.fetch(cacheKey(env.AWS_ACCESS_KEY));
        const {
            Contents,
            CommonPrefixes,
            IsTruncated,
            KeyCount,
            MaxKeys,
            Name,
            Prefix
        } = pdfObjects ?? await getAllPdfObjects(bucket, maxKeys);

        await Contents.forEach((document: any) => {
            const { base: documentName, dir } = parse(document.Key);
            let documentOwner = dir === '' ? 'root' : dir;
            saveFilteredObjects(documentName, JSON.parse(document.ETag), documentOwner)
        });
        return response.status(200).json({
            status: 'success',
            Contents,
            CommonPrefixes,
            IsTruncated,
            KeyCount,
            MaxKeys,
            Name,
            Prefix
        });
    }
    catch (e) {
       console.log(e);
       throw e;
    }
};

export const deleteDocument = async function deleteDocument(request: express.Request, response: express.Response) {
    try {
        const { documentOwner, documentName } = request.query;
        const result = await removeDocument(documentOwner, documentName);
        if(!result){
            return response.status(404).json({
                status: 'NotFound',
                message: 'Document was not found!'
            })
        }
        return response.status(200).json({
            status: 'success',
            result
        })
    }
    catch(err) {
        throw err;
    }
};
