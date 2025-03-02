import React from 'react';
import { Provider } from 'react-redux';
import { Router, Auth, MessageConnector } from '../../router';
import { Page, Store } from '../../../types';
import { getPageNameFromPage } from '../../../tools';

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
      <Auth initialUser={user}>
        {({ user: _user, setUser }) => (
          <Router
            initialPageName={getPageNameFromPage({ page })}
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
