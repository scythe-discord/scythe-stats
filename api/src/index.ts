import 'reflect-metadata';

import { graphqlServer } from './graphql';
import { dbConnection } from './db';

graphqlServer.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});

dbConnection.then(() => {
  console.log('Database connection ready!');
});
