import { Router } from "express";
import { createHighlights, getHighlights } from "./HighlightsController";
import { validateRequestBody, validateGetRequestParams } from "../../middleware/HighlightMiddleware";

const highlightsRouter = Router();

highlightsRouter.post('/documents/highlights', validateRequestBody, createHighlights );

highlightsRouter.get('/documents/highlights', validateGetRequestParams, getHighlights );

export default highlightsRouter;
