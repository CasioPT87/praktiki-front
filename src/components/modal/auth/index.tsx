import React, { useEffect, useState } from 'react';
import Modal from '../../ui/modal';
import Button from '../../ui/button';
import goTo from '../../../core/router/utils/goTo';
import { loginAsGuest } from '../../../client-utils';
import ChooseLanguages, { Language, ChosenLanguages } from '../../functional/languages'

const AuthModal: React.FC<{
  setUser: (value: React.SetStateAction<Object | null>) => void;
}> = ({ setUser }) => {
  const [chosenLanguages, setChosenLanguages] = useState<ChosenLanguages>({
    fluentLanguageId: null,
    practiceLanguageId: null,
  });

  const [asGuest, setAsGuest] = useState<boolean>(false);

  return (
    <Modal initiallyOpen={true}>
      {!asGuest && (
        <>
          <Button
            text="Login"
            onClick={() =>
              goTo({
                pageName: 'login',
                redirect: true,
                pushHistoryState: false,
              })
            }
          />
          <Button
            text="Create account"
            onClick={() =>
              goTo({
                pageName: 'register',
                redirect: true,
                pushHistoryState: false,
              })
            }
          />
          <Button text="Login as guest" onClick={() => setAsGuest(true)} />
        </>
      )}
      {asGuest && (
        <div>
          <ChooseLanguages onSelect={setChosenLanguages}/>
         
          <Button
            disabled={!Object.values(chosenLanguages).every(Boolean)}
            text="Login as guest"
            onClick={async () => {
              const user = await loginAsGuest(chosenLanguages);
              setUser(user);
            }}
          />
        </div>
      )}
      <div />
    </Modal>
  );
};

export default AuthModal;
