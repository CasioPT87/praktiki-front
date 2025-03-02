// @ts-nocheck
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import goTo from '../../core/router/utils/goTo';
import '../../styles/index.scss';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { PlainObject } from '../../types';

function calculateCenter(positions: Array<[number, number]>): [ number, number] {
  if (!positions.length) return null;

  let sumX = 0, sumY = 0;
  
  for (const pos of positions) {
      sumX += pos[0];
      sumY += pos[1];
  }

  return [
      sumX / positions.length,
      sumY / positions.length
  ];
}

// Fix default icon issue for Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const Home: React.FC<{ user: PlainObject | null }> = ({ user }) => {

  const positionMadrid = [40.4168, -3.7038]; // Example coordinates
  const positionLondon = [51.5074, -0.1276]; // Example coordinates

  return (
    <div>
      <h1>Home Test Page</h1>
      <h2>Hola soy el dashboard del nuevo front</h2>
      <button
        className="button-test"
        onClick={() => goTo({ pageName: 'profile' })}
      >
        Go to Profile
      </button>
      <button
        className="button-test"
        onClick={() => goTo({ pageName: 'articles' })}
      >
        Go to Articles (is Private)
      </button>
      <button
        id="test-home-goto-messages"
        className="button-test"
        onClick={() =>
          goTo({ pageName: 'messages' })
        }
      >
        Go to Messages
      </button>
      <button
        id="test-home-goto-conversation"
        className="button-test"
        onClick={() =>
          goTo({ pageName: 'conversation' })
        }
      >
        Go to Conversation
      </button>
      <button
        id="test-home-goto-login"
        className="button-test"
        onClick={() =>
          goTo({ pageName: 'login' })
        }
      >
        Go to Login
      </button>
      <button
        id="test-home-goto-login"
        className="button-test"
        onClick={() =>
          goTo({ pageName: 'register'})
        }
      >
        Go to Register
      </button>
      {user && <pre>{JSON.stringify(user)}</pre>}
      <p id="logged">logged: {user ? 'true' : 'false'}</p>

      <MapContainer
        center={calculateCenter([positionMadrid, positionLondon])}
        zoom={4}
        scrollWheelZoom={true}
        style={{ height: '50vh', width: '50%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={positionMadrid}>
          <Popup>
            A pretty CSS3 popup. <br /> Easily customizable.
          </Popup>
        </Marker>
        <Marker position={positionLondon}>
          <Popup>
            A pretty CSS3 popup. <br /> Easily customizable.
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default Home;
