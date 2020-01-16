import { APP_SERVER_PORT } from './common/config';
import { app } from './app';
import { graphqlServer } from './graphql';
import { sequelize } from './db';

graphqlServer.applyMiddleware({ app });

app.listen(APP_SERVER_PORT, () => {
  console.log(`Starting scythe-stats app server on port ${APP_SERVER_PORT}`);
  console.log(
    `You can access the graphql server at http://localhost:${APP_SERVER_PORT}${graphqlServer.graphqlPath}`
  );
});

sequelize
  .authenticate()
  .then(() => {
    console.log('Successfully connected to the database!');
  })
  .catch((err: Error) => {
    console.error('Unable to connect to the database:', err);
  });
