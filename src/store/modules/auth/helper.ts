import { ss } from '@/utils/storage';

const TOKEN_NAME = 'SECRET_TOKEN';
const EXPIRE_TIME_NAME = 'TOKEN_EXPIRE_TIME';

export function getToken() {
  const token = ss.get(TOKEN_NAME);
  const expireTime = ss.get(EXPIRE_TIME_NAME);

  if (token && expireTime) {
    const currentTime = new Date().getTime();
    if (currentTime > parseInt(expireTime, 10)) {
      removeToken();
      return undefined;
    }
    return token;
  }
  return undefined;
}

export function setToken(token: string, expiresIn: number) {
  // expiresIn 参数现在是一个绝对的过期时间戳
  ss.set(TOKEN_NAME, token);
  ss.set(EXPIRE_TIME_NAME, expiresIn.toString());
}

export function removeToken() {
  ss.remove(TOKEN_NAME);
  ss.remove(EXPIRE_TIME_NAME);
}
