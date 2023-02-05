import 'reflect-metadata';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { json } from 'body-parser';

import express from 'express';
import session from 'express-session';
import cors from 'cors';
import connectRedis from 'connect-redis';
import { Context, resolveContext } from './graphql/context';
import schema from './graphql/schema';
import { scytheDb } from './db';
import { API_SERVER_PORT, SESSION_SECRET, SITE_URL } from './common/config';
import { redisClient } from './common/services';
import { authRouter } from './routes';
import http from 'http';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';

const MAX_COOKIE_AGE = 1000 * 60 * 60 * 24 * 7;

async function startApolloServer() {
  scytheDb
    .initialize()
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
      origin: [SITE_URL, 'https://studio.apollographql.com'],
      credentials: true,
    })
  );
  app.use(session(sessionConf));
  app.use('/auth', authRouter);

  const graphqlServer = new ApolloServer<Context>({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
      ApolloServerPluginLandingPageLocalDefault({
        embed: true,
      }),
    ],
  });
  await graphqlServer.start();
  app.use(
    '/graphql',
    cors({
      origin: [SITE_URL, 'https://studio.apollographql.com'],
      credentials: true,
    }),
    json(),
    expressMiddleware<Context>(graphqlServer, {
      context: resolveContext,
    })
  );

  console.log(`🚀  Server ready at ${SITE_URL}`);

  const wsServer = new WebSocketServer({
    // This is the `httpServer` we created in a previous step.
    server: httpServer,
    // Pass a different path here if your ApolloServer serves at
    // a different path.
    path: '/graphql',
  });

  const serverCleanup = useServer({ schema }, wsServer);

  await new Promise<void>((resolve) =>
    httpServer.listen({ port: API_SERVER_PORT }, resolve)
  );
}

startApolloServer().then().catch();
