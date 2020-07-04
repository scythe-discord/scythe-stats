import { FC, createContext, useEffect, useState } from 'react';

import GQL from 'lib/graphql';

export interface AuthContextInfo {
  discordMe: Pick<GQL.DiscordUser, 'id' | 'username' | 'discriminator'> | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextInfo>({
  discordMe: null,
  loading: false,
});

interface Props {
  initAuthCheck: boolean;
}

export const AuthProvider: FC<Props> = ({ initAuthCheck, ...rest }) => {
  const [loadDiscordMe, { data, loading }] = GQL.useDiscordMeLazyQuery();
  const [initLoadComplete, setInitLoadComplete] = useState(false);

  useEffect(() => {
    if (initAuthCheck && !initLoadComplete) {
      loadDiscordMe();
      setInitLoadComplete(true);
    }
  }, [initAuthCheck, initLoadComplete]);

  const discordMe = data && data.discordMe ? data.discordMe : null;

  return (
    <AuthContext.Provider
      value={{
        discordMe,
        loading,
      }}
      {...rest}
    />
  );
};
