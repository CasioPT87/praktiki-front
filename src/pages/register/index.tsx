import React, { useContext, useEffect, useState } from 'react';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import {
  setCookieServer,
  registerUser,
} from '../../client-utils';
import '../../styles/index.scss';
import ChooseLanguages, { ChosenLanguages } from '../../components/functional/languages';
import Button from '../../components/ui/button';
import useClearData from '../../hooks/useClearData';

function Register({
  setUser,
  user,
}: {
  setUser: React.Dispatch<React.SetStateAction<any>>;
  user: Object | null;
}): React.JSX.Element {
  const [nameValue, setNameValue] = useState<string>('');
  const [passValue, setPassValue] = useState<string>('');
  const [chosenLanguages, setChosenLanguages] = useState<ChosenLanguages>({
    fluentLanguageId: null,
    practiceLanguageId: null,
  });
  useClearData(['locationChat', 'privateChat'])

  async function register() {
    const response = await registerUser({
      username: nameValue,
      password: passValue,
      chosenLanguages
    });

    const token = response?.token

    if (token) {
        const user = jwtDecode<JwtPayload>(token);
        setUser({ user });
        await setCookieServer({ token });
    }
  }
  
  function readyToRegister() {
    return nameValue && passValue && chosenLanguages.fluentLanguageId && chosenLanguages.practiceLanguageId
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
      <ChooseLanguages onSelect={setChosenLanguages}/>
      </div>
      <Button
        id="test-login-login"
        disabled={!readyToRegister()}
        text='authentication!!!'
        onClick={() => register()}
      />
       
     
      {user && <pre>{JSON.stringify(user)}</pre>}
      {!user && <p>not logged in</p>}
    </>
  );
}

export default Register;
