import { Router } from 'express';
import { handleAwsEvents} from "./AwsEventsController";

const awsRouter = Router();

awsRouter.post('/events', handleAwsEvents);

export default awsRouter;
