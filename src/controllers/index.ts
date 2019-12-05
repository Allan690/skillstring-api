import express from 'express';
import documentRouter from './DocumentController';
import highlightsRouter from "./HighlightsController";
import awsRouter from "./AWS";

const apiPrefix = '/api/v1';

const routes = (app: express.Application) => {
    app.use(apiPrefix, documentRouter);
    app.use(apiPrefix, highlightsRouter);
    app.use(apiPrefix, awsRouter);
    return app;
};

export default routes;
