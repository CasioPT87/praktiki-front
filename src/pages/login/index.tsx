import React, { useState } from 'react';
import {
  fetchTokenBackend,
  fetchUserBackend,
  setCookieServer,
  deleteCookie,
} from '../../client-utils';
import goTo from '../../core/router/utils/goTo';
import '../../styles/index.scss';

function Login({
  setUser,
  user,
}: {
  setUser: React.Dispatch<React.SetStateAction<any>>;
  user: Object | null;
}): React.JSX.Element {
  const [nameValue, setNameValue] = useState<string>('');
  const [passValue, setPassValue] = useState<string>('');

  async function authenticate() {
    const tokenResponse = await fetchTokenBackend({
      username: nameValue,
      password: passValue,
    });

    if (tokenResponse?.token) {
        const user = { hola: 'que' }
        setUser({ user });
        await setCookieServer({ token: tokenResponse.token });
    }
  }

  async function signOut() {
    const { success } = await deleteCookie();
    if (success) await setUser(null);
  }

  return (
    <>
      <h1>Login test page</h1>
      <div style={{ display: 'flex', flexDirection: 'column'}}>

      <label for="nameField">
        name
        <input id="nameField" type="text" value={nameValue} onClick={(e) => setNameValue(e.target.value)} />
      </label>
      <label for="passField">
        password
        <input id="passField" type="text" value={passValue} onClick={(e) => setPassValue(e.target.value)}/>
      </label>
      </div>
      <button
        id="test-login-login"
        className="button-test-2"
        onClick={authenticate}
      >
        authentication!!!
      </button>
      {user && (
        <button
          id="test-login-logout"
          className="button-test-2"
          onClick={signOut}
        >
          delete season!!!
        </button>
      )}
      {user && <pre>{JSON.stringify(user)}</pre>}
      {!user && <p>not logged in</p>}
    </>
  );
}

export default Login;
