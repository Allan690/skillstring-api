import { Router } from 'express';
import { getAllDocuments, deleteDocument} from "./DocumentController";
import { filterParams, validateDeleteParams } from "../../middleware/DocumentMiddleware";

const documentRouter = Router();

documentRouter.get(
    '/documents',
    filterParams,
    getAllDocuments
);

documentRouter.delete(
    '/documents',
    validateDeleteParams,
    deleteDocument
);

export default documentRouter;
