// @ts-nocheck
import React, { useContext, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import goTo from '../../core/router/utils/goTo';
import '../../styles/index.scss';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { PlainObject } from '../../types';
import HttpClient from '../../client-utils/httpClient';
import { UserRole } from '../../utils';
import { deleteCookie } from '../../client-utils';
import { Language } from '../../components/functional/languages';
import useClearData from '../../hooks/useClearData';

function calculateCenter(positions: Array<[number, number]>): [number, number] {
  if (!positions.length) return null;

  let sumX = 0,
    sumY = 0;

  for (const pos of positions) {
    sumX += pos[0];
    sumY += pos[1];
  }

  return [sumX / positions.length, sumY / positions.length];
}

// Fix default icon issue for Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
  iconSize: [20, 30], // [width, height]
  shadowSize: [20, 30], // Size of the shadow image
  iconAnchor: [10, 40],
});

const Home: React.FC<{
  user: PlainObject | null;
  setUser: React.Dispatch<any>;
}> = ({ user, setUser }) => {
  const [localChats, setLocalChats] = useState([]);
  const [languages, setLanguages] = useState<Array<Language>>([]);
  useClearData(['locationChat', 'privateChat']);

  const positionMadrid = [40.4168, -3.7038]; // Example coordinates
  const positionLondon = [51.5074, -0.1276]; // Example coordinates

  useEffect(() => {
    async function getLocations() {
      const response = await new HttpClient(process.env.BACKEND_URL).get(
        '/location-chats'
      );
      if (response.ok) setLocalChats(response.data);
    }
    getLocations();
  }, []);

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

  function goToChatRoom(locationChatId) {
    goTo({
      pageName: 'locationChatRoom',
      urlParams: { id: String(locationChatId) },
    });
  }

  function getLanguageName(languageId: Language['id']) {
    if (!languages.length) return '';
    return languages.find((lang) => lang.id === languageId).name;
  }

  if (localChats.length === 0) return null;

  return (
    <div className="page">
      {user && <pre>{JSON.stringify(user)}</pre>}
      <div className="page__header">
        <div className="page__logo">Praktiki</div>
        <div className="page__actions">
          {!user ||
            (user?.value === UserRole.guest && (
              <>
                {user?.value === UserRole.guest && (
                  <>
                    <div>
                      fluent at: {getLanguageName(user.fluent_language_id)}
                    </div>
                    <div>
                      want to practice:{' '}
                      {getLanguageName(user.practice_language_id)}
                    </div>
                  </>
                )}
                <button
                  className="page__button"
                  onClick={() => goTo({ pageName: 'login' })}
                >
                  Sign in
                </button>
                <button
                  className="page__button"
                  onClick={() => goTo({ pageName: 'register' })}
                >
                  Sign Up
                </button>
              </>
            ))}
          {user && user?.value === UserRole.registered && (
            <>
              <div>fluent at: {getLanguageName(user.fluent_language_id)}</div>
              <div>
                want to practice: {getLanguageName(user.practice_language_id)}
              </div>
              <button
                className="page__button"
                onClick={() => {
                  deleteCookie({ user }).then(({ success }) => {
                    if (success) setUser(null);
                  });
                }}
              >
                Log Out
              </button>
            </>
          )}
          {user && <div className="page__user">{user?.name}</div>}
        </div>
      </div>

      <button onClick={() => goTo({ pageName: 'randomVideoChat' })}>
        join random conversation
      </button>

      <div className="page__map-container">
        <MapContainer
          className="page__map"
          center={calculateCenter([positionMadrid, positionLondon])}
          zoom={4}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {localChats.map((localChat) => (
            <Marker
              position={[localChat.y_coordinates, localChat.x_coordinates]}
              eventHandlers={{ click: () => goToChatRoom(localChat.id) }}
            ></Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default Home;
