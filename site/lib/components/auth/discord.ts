import urljoin from 'url-join';

import { API_URL, DISCORD_CLIENT_ID } from '../../env';

export const API_LOGIN_URL = urljoin(API_URL, 'auth', 'login');
export const API_LOGOUT_URL = urljoin(API_URL, 'auth', 'logout');

export const DISCORD_OAUTH_REDIRECT_URI = encodeURIComponent(API_LOGIN_URL);
export const DISCORD_OAUTH_URL = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${DISCORD_OAUTH_REDIRECT_URI}&response_type=code&scope=identify`;
