import { FC, createContext } from 'react';

import GQL from '../graphql';

export interface AuthContextInfo {
  discordMe: Pick<GQL.DiscordUser, 'id' | 'username' | 'discriminator'> | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextInfo>({
  discordMe: null,
  loading: false,
});

export const AuthProvider: FC = (props) => {
  const { data, loading } = GQL.useDiscordMeQuery();

  const discordMe = data && data.discordMe ? data.discordMe : null;

  return (
    <AuthContext.Provider
      value={{
        discordMe,
        loading,
      }}
      {...props}
    />
  );
};
