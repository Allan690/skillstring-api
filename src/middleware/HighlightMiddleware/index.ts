import joi from '@hapi/joi';
import express from 'express';
import {schemaValidation} from "../DocumentMiddleware";

export const checkIfBodyIsNull = (request: express.Request) => {
    return request.body.hasOwnProperty('highlightObject') && request.body.highlightObject !== null || request.body.highlightObject !== undefined;
};

export const validateRequestBody = (request: express.Request, response: express.Response, next: express.NextFunction ) => {
    if(!checkIfBodyIsNull(request)) {
        return response.status(400).json({
            status: 'MissingParametersError',
            message: 'Please pass the highlightObject parameter to the request body'
        })
    }

    const schema = joi.object().keys({
        highlightObject: {
            content: {
                text: joi.string().trim()
            },
            position: {
                boundingRect: {
                    x1: joi.number(),
                    y1: joi.number(),
                    x2: joi.number(),
                    y2: joi.number(),
                    width: joi.number(),
                    height: joi.number()
                },
                rects: joi.array().items( {
                    x1: joi.number(),
                    y1: joi.number(),
                    x2: joi.number(),
                    y2: joi.number(),
                    width: joi.number(),
                    height: joi.number()
                }),
                pageNumber: joi.number()
            },
            comment: {
                text: joi.string(),
                emoji: joi.string().allow('', null)
            }
        },
        documentUrl: joi.string().required()
    });
    return schemaValidation(request, response, next, schema, request.body);
};

export const validateGetRequestParams = (request: express.Request, response: express.Response, next: express.NextFunction) => {
    const schema = joi.object().keys({
        documentUrl: joi.string().uri().required()
    });
    return schemaValidation(request, response, next, schema, request.query)
};
