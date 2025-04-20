import React, { useState, useEffect } from 'react';
import goTo from './utils/goTo';
import SocketIOClient from 'socket.io-client';
import {
  getAllowedPage,
  getPageNameFromPage,
  getPageValueFromPage,
  getPageFromPath,
} from '../../tools';
import { Page, PageName } from '../../types';
import { usePreloadData } from '../../hooks';
import { PreloadDataContext, MessagesSocketContext } from '../../contexts';
import { loginAsGuest } from '../../client-utils';
import { getTextMessagesManager, getVideoMessagesManager } from '../messages';
import Modal from '../../components/ui/modal';
import Button from '../../components/ui/button';
import { pageDoesNotNeedUser } from '../../tools/pages';

function usePageMonitor({ initialPath }: { initialPath: string }): {
  pageName: PageName;
  path: string;
} {
  const [pageName, setPage] = useState<PageName>(
    getPageNameFromPage({ page: getPageFromPath({ path: initialPath }) })
  );
  const [path, setPath] = useState<string>(initialPath);
  useEffect(() => {
    function changePage({ detail }: { detail: { path: string } }) {
      const page = getPageFromPath({ path: detail.path });
      const pageName = getPageNameFromPage({ page });
      setPage(pageName);
      setPath(detail.path);
    }
    if (typeof document !== 'undefined') {
      // @ts-ignore: Unreachable code error
      window.addEventListener('changePage', changePage);
    }
    return () => {
      if (typeof document !== 'undefined') {
        // @ts-ignore: Unreachable code error
        window.removeEventListener('changePage', changePage);
      }
    };
  }, []);
  return { pageName, path };
}
if (typeof document !== 'undefined') {
  window.addEventListener('popstate', function (event) {
    // FIX THIS!!
    const user = null;
    const { page } = getAllowedPage({
      path: window.location.pathname,
      userIsLogged: !!user,
    });
    const pageName = getPageNameFromPage({ page });
    goTo({ pageName, pushHistoryState: false });
  });
}

export const MessageConnector: React.FC<any> = ({ children }) => {
  const [sockets, setSockets] = useState<{ text: typeof SocketIOClient, video: typeof SocketIOClient } | null>(null);
  useEffect(() => {
    async function connect() {
      const textSocket = await getTextMessagesManager();
      const videoSocket = await getVideoMessagesManager();
      setSockets({ video: videoSocket, text: textSocket });
    }
    connect();
  }, []);

  return (
    <MessagesSocketContext.Provider value={sockets}>
      {children}
    </MessagesSocketContext.Provider>
  );
};

interface AuthProps {
  initialUser: Object | null;
  page: Page;
  children: (props: {
    user: any;
    setUser: React.Dispatch<React.SetStateAction<any>>;
  }) => React.ReactNode;
}

const Auth: React.FC<AuthProps> = ({ initialUser, children, page }: AuthProps) => {
  const [user, setUser] = useState<Object | null>(initialUser);

  if (!user && !pageDoesNotNeedUser({ page })) {
    return (
      <>
        <Modal initiallyOpen={true}>
          <Button text="Login" onClick={() => goTo({ pageName: 'login', redirect: true, pushHistoryState: false })} />
          <Button text="Create account" onClick={() => goTo({ pageName: 'register', redirect: true, pushHistoryState: false })} />
          <Button text="Login as guest" onClick={async () => {
            const user = await loginAsGuest()
            setUser(user);
          }} />
        </Modal>
        <>{children({ user, setUser })}</>
      </>
    );
  }
  return (
    <div>
      <MessageConnector>{children({ user, setUser })}</MessageConnector>
    </div>
  );
};

function Router({
  user,
  preloadData,
  setUser,
  initialUrlPath,
}: {
  user: Object | null;
  preloadData: any;
  setUser: React.Dispatch<React.SetStateAction<any>>;
  initialUrlPath: string;
}): React.JSX.Element | null {
  const { path } = usePageMonitor({ initialPath: initialUrlPath });
  const {
    page: allowedPage,
    needsRedirection,
    urlParams,
  } = getAllowedPage({
    path,
    userIsLogged: !!user,
  });

  const allowedPageName: PageName = getPageNameFromPage({ page: allowedPage });
  const pageValue = getPageValueFromPage({ page: allowedPage });
  const component = pageValue.pageComponent;

  // como cada vez que ejecutemos el "goTo" y cambiemos de pagina, este componente se vuelve a ejecutar, aqui tambien tenemos que correr el preloadFn
  const data = usePreloadData({
    component,
    preloadDataProp: preloadData,
  });
  if (needsRedirection) {
    goTo({ pageName: allowedPageName, redirect: true });
    return null;
  }

  // en el return, englobamos el resultado en "PreloadDataContext" para poder usar useContext luego con los datos del "preloadFn"
  return (
    <PreloadDataContext.Provider value={data}>
      <pageValue.pageComponent
        user={user}
        setUser={setUser}
        urlParams={urlParams}
      />
    </PreloadDataContext.Provider>
  );
}

export { Router, Auth };
