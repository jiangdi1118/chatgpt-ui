import { defineStore } from 'pinia';
import { getToken, removeToken, setToken } from './helper';
import { store } from '@/store';

export interface AuthState {
  token: string | undefined;
}

export const useAuthStore = defineStore('auth-store', {
  state: (): AuthState => ({
    token: getToken(),
  }),

  actions: {
    setToken(token: string, expiresIn: number) {
      this.token = token;
      setToken(token, expiresIn);
    },

    removeToken() {
      this.token = undefined;
      removeToken();
    },
  },
});

export function useAuthStoreWithout() {
  return useAuthStore(store);
}
