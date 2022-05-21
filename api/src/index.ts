import 'reflect-metadata';
import { ApolloServer } from 'apollo-server-express';

import express from 'express';
import session from 'express-session';
import cors from 'cors';
import connectRedis from 'connect-redis';
import { resolveContext } from './graphql/context';
import schema from './graphql/schema';
import { dbConnection } from './db';
import { API_SERVER_PORT, SESSION_SECRET, SITE_URL } from './common/config';
import { redisClient } from './common/services';
import { authRouter } from './routes';
import http from 'http';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';

const MAX_COOKIE_AGE = 1000 * 60 * 60 * 24 * 7;

async function startApolloServer() {
  dbConnection
    .then(() => {
      console.log('Database connection ready!');
    })
    .catch((e) => {
      console.error('Failed to connect to DB', e);
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
    cookie: {
      maxAge: MAX_COOKIE_AGE,
    },
  };

  const app = express();
  const httpServer = http.createServer(app);

  if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
    sessionConf.cookie = {
      secure: true,
      maxAge: MAX_COOKIE_AGE,
    };
  }

  app.use(
    cors({
      origin: SITE_URL,
      credentials: true,
    })
  );
  app.use(session(sessionConf));
  app.use('/auth', authRouter);

  const graphqlServer = new ApolloServer({
    schema,
    context: resolveContext,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });
  await graphqlServer.start();

  graphqlServer.applyMiddleware({ app, cors: false, path: '/graphql' });

  await new Promise<void>((resolve) =>
    httpServer.listen({ port: API_SERVER_PORT }, resolve)
  );
  console.log(`🚀  Server ready at ${graphqlServer.graphqlPath}`);
}

startApolloServer().then().catch();
