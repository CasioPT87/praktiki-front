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
}: {
  page: Page;
  store: Store;
  user: Object | null;
  preloadData: any;
}): React.JSX.Element => {
  return (
    <Provider store={store}>
      <Auth initialUser={user}>
        {({ user: _user, setUser }) => (
          <MessageConnector>
            <Router
              initialPageName={getPageNameFromPage({ page })}
              user={_user}
              preloadData={preloadData}
              setUser={setUser}
            />
          </MessageConnector>
        )}
      </Auth>
    </Provider>
  );
};

export { createMarkup };
