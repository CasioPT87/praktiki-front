import React, { useState } from 'react';
import Modal from '../../ui/modal';
import Button from '../../ui/button';
import goTo from '../../../core/router/utils/goTo';
import { loginAsGuest } from '../../../client-utils';

const AuthModal: React.FC<{ setUser: (value: React.SetStateAction<Object | null>) => void }> = ({ setUser }) => {
  const [languages, setLanguages] = useState<Array<any>>([])
  
  return (
    <Modal initiallyOpen={true}>
      <Button
        text="Login"
        onClick={() =>
          goTo({ pageName: 'login', redirect: true, pushHistoryState: false })
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
      <Button
        text="Login as guest"
        onClick={async () => {
          const user = await loginAsGuest();
          setUser(user);
        }}
      />
    </Modal>
  );
};

export default AuthModal
