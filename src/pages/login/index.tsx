import React, { useState } from 'react';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import {
  loginUser,
  setCookieServer,
  deleteCookie,
} from '../../client-utils';
import goTo from '../../core/router/utils/goTo';
import '../../styles/index.scss';
import { User } from '../../types';

function Login({
  setUser,
  user,
}: {
  setUser: React.Dispatch<React.SetStateAction<any>>;
  user: User | null;
}): React.JSX.Element {
  const [nameValue, setNameValue] = useState<string>('');
  const [passValue, setPassValue] = useState<string>('');

  async function authenticate() {
    const response = await loginUser({
      username: nameValue,
      password: passValue,
    });

    const token = response?.token

    if (token) {
        const user = jwtDecode<JwtPayload>(token);

        setUser({ user });
        await setCookieServer({ token });
    }
  }

  async function signOut() {
    if (user) {
      const { success } = await deleteCookie({ user });
      if (success) await setUser(null);
    }
  }

  return (
    <>
      <h1>Login test page</h1>
      <div style={{ display: 'flex', flexDirection: 'column'}}>

      <label htmlFor="nameField">
        name
        <input id="nameField" type="text" value={nameValue} onChange={(e) => setNameValue(e.target.value)} />
      </label>
      <label htmlFor="passField">
        password
        <input id="passField" type="text" value={passValue} onChange={(e) => setPassValue(e.target.value)}/>
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
