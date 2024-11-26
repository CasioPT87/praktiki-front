// @ts-nocheck
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import goTo from '../../core/router/utils/goTo';
import '../../styles/index.scss';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { PlainObject } from '../../types';

// Fix default icon issue for Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const Home: React.FC<{ user: PlainObject | null }> = ({ user }) => {
  const position = [51.505, -0.09]; // Example coordinates
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
        id="test-home-goto-login"
        className="button-test"
        onClick={() =>
          goTo({ pageName: 'login', queryString: [['myKey', 'myValue']] })
        }
      >
        Go to Login
      </button>
      {user && <pre>{JSON.stringify(user)}</pre>}
      <p id="logged">logged: {user ? 'true' : 'false'}</p>

      <MapContainer
        center={position}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: '100vh', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            A pretty CSS3 popup. <br /> Easily customizable.
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default Home;
