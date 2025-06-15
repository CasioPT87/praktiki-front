import React, { useEffect, useState } from 'react';
import HttpClient from '../../../client-utils/httpClient';

export interface Language {
  id: number;
  name: string;
}

export interface ChosenLanguages {
  fluentLanguageId: Language['id'] | null;
  practiceLanguageId: Language['id'] | null;
}

const ChooseLanguages: React.FC<{ onSelect: (data: ChosenLanguages) => void }> = ({ onSelect }) => {
  const [languages, setLanguages] = useState<Array<Language>>([]);
  const [chosenLanguages, setChosenLanguages] = useState<ChosenLanguages>({
    fluentLanguageId: null,
    practiceLanguageId: null,
  });

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

  useEffect(() => {
    if (chosenLanguages.fluentLanguageId && chosenLanguages.practiceLanguageId) {
        onSelect(chosenLanguages)
    }
  }, [chosenLanguages]);

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
    </div>
  );
};

export default ChooseLanguages
