import 'reflect-metadata';

import express from 'express';
import { graphqlServer } from './graphql';
import { dbConnection } from './db';
import { API_SERVER_PORT } from './common/config';

const app = express();

graphqlServer.applyMiddleware({ app });
app.listen({ port: API_SERVER_PORT }, () =>
  console.log(`🚀  Server ready at ${graphqlServer.graphqlPath}`)
);

dbConnection.then(() => {
  console.log('Database connection ready!');
});
