import 'reflect-metadata';

import express from 'express';
import session from 'express-session';
import redis from 'redis';
import cors from 'cors';
import connectRedis from 'connect-redis';
import { graphqlServer } from './graphql';
import { dbConnection } from './db';
import {
  API_SERVER_PORT,
  REDIS_HOST,
  REDIS_PORT,
  REDIS_PASSWORD,
  SESSION_SECRET,
  SITE_URL,
} from './common/config';
import { authRouter } from './routes';

const app = express();

const redisClient = redis.createClient({
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD,
});
const RedisStore = connectRedis(session);
const redisStoreInstance = new RedisStore({
  client: redisClient,
});

const sessionConf: session.SessionOptions = {
  store: redisStoreInstance,
  saveUninitialized: false,
  secret: SESSION_SECRET,
  resave: false,
  cookie: {},
};

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
  sessionConf.cookie = {
    secure: true,
  };
}

app.use(
  cors(
    process.env.NODE_ENV === 'production'
      ? undefined
      : {
          origin: SITE_URL,
          credentials: true,
        }
  )
);
app.use(session(sessionConf));
app.use('/auth', authRouter);

graphqlServer.applyMiddleware({ app, cors: false });

app.listen({ port: API_SERVER_PORT }, () =>
  console.log(`🚀  Server ready at ${graphqlServer.graphqlPath}`)
);

dbConnection.then(() => {
  console.log('Database connection ready!');
});
