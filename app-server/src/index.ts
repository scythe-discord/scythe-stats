import { GRAPHQL_SERVER_PORT, APP_SERVER_PORT } from './common/config';
import { appServer } from './app';
import { graphqlServer } from './graphql';

appServer.listen(APP_SERVER_PORT, () =>
  console.log(`Starting scythe-stats app server on port ${APP_SERVER_PORT}`)
);

graphqlServer.listen({
    port: GRAPHQL_SERVER_PORT,
}).then(({ url }) => console.log(`Starting scythe-stats Apollo server at ${url}`));