import express from 'express';
import { parse} from "path";
import cache from "../../cache";
import {saveDocumentHighlights, getAllHighlights, getHighlightsKey} from "../../services/Documents/DocumentService";

/**
 * @description creates an instance of a highlight in a document
 * @param request
 * @param response
 */
export const createHighlights = async function createHighlights(request: express.Request, response: express.Response) {
    try {
        const { highlightObject, documentUrl } = request.body;
        const { documentName, documentCreator } = getOwnerAndNameFromUrl(documentUrl);
        const result = await saveDocumentHighlights(highlightObject, documentName, documentCreator);
        return response.status(200).json({
            status: 'success',
            message: 'Highlight saved successfully',
            result
        });
    }
    catch (err) {
        throw err;
    }
};

/**
 * @description fetches all the highlights in a document
 * @param request
 * @param response
 */
export const getHighlights = async function getHighlights(request: express.Request, response: express.Response) {
    try {
        const { documentUrl } = request.query;
        const { documentName, documentCreator } = getOwnerAndNameFromUrl(documentUrl);
        const result = await cache.fetch(getHighlightsKey(documentCreator, documentName));
        const results = result ?? await getAllHighlights(documentName, documentCreator);
        return response.status(200).json({
            status: 'success',
            results
        });
    }
    catch(err) {
        throw err;
    }
};

export const getOwnerAndNameFromUrl = (url: string) => {
    const documentName = parse(url).base;
    const documentCreator = parse(parse(url).dir).name;
    return { documentName, documentCreator }
};
