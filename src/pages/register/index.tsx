import React, { useState } from 'react';
import {
  setCookieServer,
  deleteCookie,
  registerUser,
} from '../../client-utils';
import goTo from '../../core/router/utils/goTo';
import '../../styles/index.scss';

function Register({
  setUser,
  user,
}: {
  setUser: React.Dispatch<React.SetStateAction<any>>;
  user: Object | null;
}): React.JSX.Element {
  const [nameValue, setNameValue] = useState<string>('');
  const [passValue, setPassValue] = useState<string>('');

  async function register() {
    const tokenResponse = await registerUser({
      username: nameValue,
      password: passValue,
    });

    if (tokenResponse?.token) {
      if (user) {
        setUser({ user });
        await setCookieServer({ token: tokenResponse.token });
      }
    }
  }

  return (
    <>
      <h1>Register page</h1>
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
        onClick={register}
      >
        authentication!!!
      </button>
      {user && <pre>{JSON.stringify(user)}</pre>}
      {!user && <p>not logged in</p>}
    </>
  );
}

export default Register;
