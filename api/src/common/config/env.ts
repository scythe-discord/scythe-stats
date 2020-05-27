export const BOT_TOKEN = process.env.BOT_TOKEN || '';
export const GAME_LOG_PREFIX = process.env.GAME_LOG_PREFIX || '';
export const GUILD_ID = process.env.GUILD_ID || '';
export const VANILLA_LOG_CHANNEL_ID = process.env.VANILLA_LOG_CHANNEL_ID || '';

export const DB_NAME = process.env.DB_NAME || 'scythe';
export const DB_USERNAME = process.env.DB_USERNAME || 'postgres';
export const DB_PASSWORD = process.env.DB_PASSWORD || 'postgres';
export const DB_HOST = process.env.DB_HOST || 'localhost';
export const DB_PORT = Number(process.env.DB_PORT) || 5432;

export const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
export const REDIS_PASSWORD = process.env.REDIS_PASSWORD || 'redis';
export const REDIS_PORT = Number(process.env.REDIS_PORT) || 6379;

export const SESSION_SECRET = process.env.SESSION_SECRET || 'banrusinno';

export const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || '';
export const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || '';

export const API_URL = process.env.API_URL || 'http://localhost:4000';
export const API_SERVER_PORT = process.env.API_SERVER_PORT || 4000;

export const SITE_URL = process.env.SITE_URL || 'http://localhost:3000';

export const GRAPHQL_SERVER_BASIC_AUTH =
  process.env.GRAPHQL_SERVER_BASIC_AUTH || 'bancrimmil';
