import crypto from 'crypto';

export default {
  randomValueHex(len) {
    return crypto
      .randomBytes(Math.ceil(len / 2))
      .toString('hex')
      .slice(0, len);
  },

  return400Error(res, message) {
    return res.status(400).json({
      error: message,
    });
  },
};
