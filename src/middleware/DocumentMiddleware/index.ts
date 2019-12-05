import express from 'express';
import joi from '@hapi/joi';

export const filterParams = (request: express.Request, response: express.Response, next: express.NextFunction) => {
if(!containsRequiredParams(request)) {
    return response.status(400).json({
        status: 'MissingParamsError',
        message: 'Please supply both the bucket and maxKeys query parameters'
    });
}
return validateQueryParams(request, response, next, request.query);
};


const validateQueryParams = (request: express.Request, response: express.Response, next: express.NextFunction, objectToValidate: object) => {
    const schema = joi.object().keys({
        bucket: joi.string().trim(),
        maxKeys: joi.number()
    });
    return schemaValidation(request, response, next, schema, request.query);
};

export const schemaValidation = (
                          request: express.Request,
                          response: express.Response,
                          next: express.NextFunction,
                          schema: any,
                          objectToValidate: any
) => {
    const { error, value } = schema.validate(objectToValidate, { abortEarly: false });
    if (error) {
        const errorArr: string[] = [];
        const { details: errorDetails } = error;
        errorDetails.forEach((err: any) => {
            const { context: { key }, message } = err;
            errorArr.push(message);
        });
        return response.status(400).send({
            message: 'ValidationError',
            error: errorArr
        });
    }
   if(request.method === 'POST') {
       request.body = value;
       return next();
   }
   if(request.method === 'DELETE') {
       request.params = value;
       return next();
   }
    request.query = value;
    return next();
};

const containsRequiredParams = (request: express.Request) => {
  return request.query.hasOwnProperty('bucket') && request.query.hasOwnProperty('maxKeys');
};

export const validateDeleteParams = async (request: express.Request, response: express.Response, next: express.NextFunction) => {
    const schema = joi.object().keys({
        documentOwner: joi.string().trim().required(),
        documentName: joi.string().trim().required()
    });
    return schemaValidation(request, response, next, schema, request.query)
};