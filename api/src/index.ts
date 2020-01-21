import { graphqlServer } from './graphql';
import { sequelize } from './db';

graphqlServer.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});

sequelize
  .authenticate()
  .then(() => {
    console.log('Successfully connected to the database!');
  })
  .catch((err: Error) => {
    console.error('Unable to connect to the database:', err);
  });
