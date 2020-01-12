import * as express from 'express';
import { EXPRESS_PORT } from './common/config';

const app = express();

app.listen(EXPRESS_PORT, () =>
  console.log(`Starting scythe-stats app server on port ${EXPRESS_PORT}`)
);
