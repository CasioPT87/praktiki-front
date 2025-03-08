import React from 'react';
import { Provider } from 'react-redux';
import { Router, Auth, MessageConnector } from '../../router';
import { Page, Store } from '../../../types';

const createMarkup = ({
  page,
  store,
  user,
  preloadData,
  initialUrlPath,
}: {
  page: Page;
  store: Store;
  user: object | null;
  preloadData: any;
  initialUrlPath: string;
}): React.JSX.Element => {
  return (
    <Provider store={store}>
      <Auth initialUser={user} page={page}>
        {({ user: _user, setUser }) => (
          <Router
            initialUrlPath={initialUrlPath}
            user={_user}
            preloadData={preloadData}
            setUser={setUser}
          />
        )}
      </Auth>
    </Provider>
  );
};

export { createMarkup };
