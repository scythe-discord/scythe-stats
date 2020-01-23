import { graphqlServer } from './graphql';

graphqlServer.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
