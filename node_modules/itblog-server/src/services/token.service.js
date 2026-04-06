import { V3 } from 'paseto';

const secretKey = process.env.PASETO_LOCAL_KEY || '0'.repeat(64);

export const tokenService = {
  async signAccess(payload) {
    return V3.encrypt(
      { ...payload, type: 'access' },
      secretKey,
      { expiresIn: '15 min', issuer: 'itblog.dev', audience: 'itblog-api' }
    );
  },

  async signRefresh(payload) {
    return V3.encrypt(
      { ...payload, type: 'refresh' },
      secretKey,
      { expiresIn: '7 days', issuer: 'itblog.dev', audience: 'itblog-api' }
    );
  },

  async verify(token) {
    const payload = await V3.decrypt(token, secretKey, {
      issuer: 'itblog.dev',
      audience: 'itblog-api',
    });
    return payload;
  },
};
