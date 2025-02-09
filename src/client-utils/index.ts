import { manageError } from '../tools';

const backendUrl = process.env.BACKEND_URL;
const serverUrl = process.env.SERVER_URL;
const cookiesPath = process.env.COOKIES_PATH;
const cookiesBackendName = process.env.PORTAL_SUFIX;
const backendDeleteSessionPath = process.env.BACKEND_CLOSE_AUTH_PATH;

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
}): Promise<Object | null> {
  try {
    // if (!backendUrl || !backendUserPath) {
    //   throw new Error('Problem finding global url');
    // }
    // const reliesOnCookies = !token;
    // const response = await fetch(backendUrl + backendUserPath, {
    //   credentials: 'include',
    //   method: 'GET',
    //   ...(reliesOnCookies
    //     ? {}
    //     : { headers: { Authorization: `Bearer ${token}` } }),
    // });
    // if (response.ok) {
    //   const { data: user } = await response.json();
    //   return user;
    // }
    // return null;
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
    // cuando no es produccion, creamos cookies con sameSite: 'none', para que mande la cookie al apiGateway en desarrollo
    // tb secure=false (para que se pueda mandar entre los localhosts, que son http y no https)
    // y al ser el browser, no se puede establecer httpOnly (si puede ser modificada con js), por lo que es httpOnly = false
    else {
      if (!token) throw new Error('Problem setting cookie for development');
      document.cookie = `${cookiesBackendName}=${token}; secure=false; samesite=none`;
      return true;
    }
  } catch (e) {
    manageError({ error: e });
    return false;
  }
}

export async function deleteCookie(): Promise<{ success: boolean }> {
  try {
    await deleteBackendCookie();
    await deleteServerCookie();
    return { success: true };
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

export async function deleteBackendCookie(): Promise<{ success: boolean }> {
  try {
    if (!backendUrl || !backendAuthPath)
      throw new Error('Problem finding global url');
    const response = await fetch(backendUrl + backendDeleteSessionPath, {
      method: 'POST',
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
