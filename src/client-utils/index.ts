import { manageError } from '../tools';
import { User } from '../types';
import HttpClient from './httpClient';

const backendUrl = process.env.BACKEND_URL;
const serverUrl = process.env.SERVER_URL;
const cookiesPath = process.env.COOKIES_PATH;
const cookiesBackendName = process.env.PORTAL_SUFIX;
const backendDeleteSessionPath = process.env.BACKEND_CLOSE_AUTH_PATH;
const appName = process.env.APP_NAME

export async function registerUser({
  username,
  password,
}: {
  username: string;
  password: string;
}): Promise<{ token: string } | null> {
  try {
    if (!backendUrl) throw new Error('Problem finding global url');
    const response = await fetch(backendUrl + '/users/register', {
      method: 'POST',
      body: JSON.stringify({
        username,
        password,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (response.ok) {
      const data = await response.json();
      return data;
    }
    return null;
  } catch (e) {
    manageError({ error: e });
    return null;
  }
}

export async function loginUser({
  username,
  password,
}: {
  username: string;
  password: string;
}): Promise<{ token: string } | null> {
  try {
    if (!backendUrl) throw new Error('Problem finding global url');
    const response = await fetch(backendUrl + '/users/login', {
      method: 'POST',
      body: JSON.stringify({
        username,
        password,
      }),
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (response.ok) {
      const data = await response.json();
      return data;
    }
    return null;
  } catch (e) {
    manageError({ error: e });
    return null;
  }
}

export async function fetchUserBackend({
  token,
}: {
  token: string | null;
}): Promise<{ } | null> {
  try {
    if (!backendUrl) {
      throw new Error('Problem finding global url');
    }
    const reliesOnCookies = !token;
    const response = await fetch(backendUrl + '/users/logged', {
      credentials: 'include',
      method: 'GET',
      ...(reliesOnCookies
        ? {}
        : { headers: { Authorization: `Bearer ${token}` } }),
    });
    if (response.ok) {
      const user = await response.json();
      return user;
    }
    return null;
  } catch (e) {
    manageError({ error: e });
    return null;
  }
}

// mirar comentario en endpoint ser server del front para entender porque hacemos esto
export async function setCookieServer({
  token,
}: {
  token: string;
}): Promise<Object | boolean> {
  try {
    // cuando es produccion, mandamos la cookie al server del front, para que meta cookies seguras (sameSite: 'strict')
    if (process.env.NODE_ENV === 'production') {
      if (!cookiesPath) throw new Error('Problem finding global url');
      const response = await fetch(serverUrl + cookiesPath, {
        method: 'POST',
        body: JSON.stringify({
          token,
        }),
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) return true;
      return false;
    }
    // when its not production, we put the token in the localstorage
    else {
      if (!token) throw new Error('Problem setting cookie for development');
      if (appName) localStorage.setItem(appName, token)
      return true;
    }
  } catch (e) {
    manageError({ error: e });
    return false;
  }
}

export async function deleteCookie({ user }: { user: User }): Promise<{ success: boolean }> {
  try {
    if (process.env.NODE_ENV === 'production') {
    await deleteBackendCookie({ user });
    await deleteServerCookie();
    return { success: true };
    } else {
      if (appName) localStorage.removeItem(appName)
      return { success: true }
    }
  } catch (e) {
    return { success: false };
  }
}

export async function deleteServerCookie(): Promise<boolean> {
  try {
    if (!cookiesPath) throw new Error('Problem finding global url');
    const response = await fetch(serverUrl + cookiesPath, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (response.ok) return true;
    return false;
  } catch (e) {
    manageError({ error: e });
    return false;
  }
}

export async function deleteBackendCookie({ user }: { user: User }): Promise<{ success: boolean }> {
  try {
    if (!backendUrl || !user?.id) {
      throw new Error('Problem finding global url');
    }
    const response = await fetch(backendUrl + '/users/' + user.id, {
      method: 'DELETE',
      credentials: 'include',
    });

    return { success: !!response.ok };
  } catch (e) {
    if (e instanceof Error) {
      console.error(e.stack);
    } else {
      console.error('unknown error');
    }

    return { success: false };
  }
}

export const loginAsGuest = async () => {
  const response = await new HttpClient(process.env.BACKEND_URL).get('/users/register/guest')
  if (response.ok) {
    if (process.env.NODE_ENV !== 'production' && typeof document !== 'undefined' && process.env.APP_NAME) {
      localStorage.setItem(process.env.APP_NAME, response.data?.token)
    }
    return response.data?.user || null
  }
}
