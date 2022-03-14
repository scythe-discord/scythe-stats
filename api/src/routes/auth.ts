import express from 'express';
import got from 'got';
import urljoin from 'url-join';

import {
  API_URL,
  SITE_URL,
  DISCORD_CLIENT_ID,
  DISCORD_CLIENT_SECRET,
} from '../common/config';

const DISCORD_TOKEN_URL = 'https://discord.com/api/oauth2/token';

const router = express.Router();

router.get('/login', async (req, res) => {
  if (!req.query.code) {
    // Login methods other than Discord not supported at this time
    res.sendStatus(404);
    return;
  }

  const authCode = req.query.code;

  try {
    const { body } = await got.post(DISCORD_TOKEN_URL, {
      form: {
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code: authCode,
        redirect_uri: urljoin(API_URL, 'auth', 'login'),
        scope: 'identify',
      },
    });
    const parsedBody = JSON.parse(body) as {
      access_token: string;
      token_type: string;
      expires_in: number;
      refresh_token: string;
      scope: string;
    };


    if (req.session) {
      req.session.discordTokenInfo = parsedBody;
    }
  } catch (e) {
    console.error(e);
  }

  res.redirect(SITE_URL);
});

router.get('/logout', async (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      res.clearCookie('connect.sid', { path: '/' }).redirect(SITE_URL);
      if (err) {
        console.error('Failed to destroy session', req.session, err);
      }
    });
  } else {
    res.redirect(SITE_URL);
  }
});

export default router;
