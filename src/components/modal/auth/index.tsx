import React, { useEffect, useState } from 'react';
import Modal from '../../ui/modal';
import Button from '../../ui/button';
import goTo from '../../../core/router/utils/goTo';
import { loginAsGuest } from '../../../client-utils';
import HttpClient from '../../../client-utils/httpClient';

interface Language {
  id: number;
  name: string;
}

export interface ChosenLanguages {
  fluentLanguageId: Language['id'] | null;
  practiceLanguageId: Language['id'] | null;
}

const AuthModal: React.FC<{
  setUser: (value: React.SetStateAction<Object | null>) => void;
}> = ({ setUser }) => {
  const [languages, setLanguages] = useState<Array<Language>>([]);
  const [chosenLanguages, setChosenLanguages] = useState<ChosenLanguages>({
    fluentLanguageId: null,
    practiceLanguageId: null,
  });
  const [asGuest, setAsGuest] = useState<boolean>(false);

  useEffect(() => {
    async function fetchLanguages() {
      const response = await new HttpClient(process.env.BACKEND_URL).get(
        '/languages'
      );
      if (response.ok) {
        const languages = response.data as any[];
        setLanguages(languages);
      }
    }
    fetchLanguages();
  }, []);

  function addChosenLanguage(
    type: 'fluent' | 'practice',
    chosenLanguage: Language
  ) {
    const otherLanguage = languages.find(
      (language) => language.id !== chosenLanguage.id
    );
    if (!otherLanguage) return;
    setChosenLanguages(() => {
      if (type === 'fluent') {
        return {
          fluentLanguageId: chosenLanguage.id,
          practiceLanguageId: otherLanguage.id,
        };
      } else {
        return {
          fluentLanguageId: otherLanguage.id,
          practiceLanguageId: chosenLanguage.id,
        };
      }
    });
  }

  function languageHasBeenSelected(
    type: 'fluent' | 'practice',
    languageId: Language['id']
  ) {
    if (type === 'fluent')
      return chosenLanguages.fluentLanguageId === languageId;
    if (type === 'practice')
      return chosenLanguages.practiceLanguageId === languageId;
  }

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
          <div>
            <div>I'm fluent in:</div>
            {languages.length > 0 &&
              languages.map((language) => {
                return (
                  <div
                    style={{
                      opacity: languageHasBeenSelected('fluent', language.id)
                        ? 1
                        : 0.5,
                    }}
                    onClick={() => addChosenLanguage('fluent', language)}
                  >
                    {language.name}
                  </div>
                );
              })}
          </div>
          <div>I want to practice:</div>
          {languages.length > 0 &&
            languages.map((language) => {
              return (
                <div
                  style={{
                    opacity: languageHasBeenSelected('practice', language.id)
                      ? 1
                      : 0.5,
                  }}
                  onClick={() => addChosenLanguage('practice', language)}
                >
                  {language.name}
                </div>
              );
            })}
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
