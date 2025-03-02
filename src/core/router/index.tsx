import React, { useState, useEffect } from 'react';
import routes from '../../routes';
import goTo from './utils/goTo';
import SocketIOClient from 'socket.io-client';
import {
  getAllowedPage,
  getPageNameFromPage,
  getPageValueFromPage,
  getPageFromPath
} from '../../tools';
import { PageName } from '../../types';
import { usePreloadData } from '../../hooks';
import { PreloadDataContext, MessagesSocketContext } from '../../contexts';
import { fetchUserBackend, setCookieServer } from '../../client-utils';
import { getMessagesManager } from '../messages';

function usePageMonitor({ initialPath }: { initialPath: string }): {
  pageName: PageName;
  path: string;
} {
  const [pageName, setPage] = useState<PageName>(
    getPageNameFromPage({ page: getPageFromPath({ path: initialPath }) }),
  );
  const [path, setPath] = useState<string>(initialPath);
  useEffect(() => {
    function changePage({ detail }: { detail: { path: string } }) {
      const page = getPageFromPath({ path: detail.path });
      const pageName = getPageNameFromPage({ page });
      setPage(pageName);
      setPath(detail.path);
    }
    if (typeof document !== "undefined") {
      // @ts-ignore: Unreachable code error
      window.addEventListener("changePage", changePage);
    }
    return () => {
      if (typeof document !== "undefined") {
        // @ts-ignore: Unreachable code error
        window.removeEventListener("changePage", changePage);
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

interface AuthProps {
  initialUser: Object | null;
  children: (props: {
    user: any;
    setUser: React.Dispatch<React.SetStateAction<any>>;
  }) => React.ReactNode;
}

export const MessageConnector: React.FC<any> = ({ children }) => {
  const [socket, setSocket] = useState<typeof SocketIOClient | null>(null);
  useEffect(() => {
    async function connect() {
      const socket = await getMessagesManager();
      setSocket(socket);
    }
    connect();
  }, []);

  return (
    <MessagesSocketContext.Provider
      value={socket}
    >
      {children}
    </MessagesSocketContext.Provider>
  );
};

const Auth: React.FC<AuthProps> = ({ initialUser, children }: AuthProps) => {
  const [user, setUser] = useState<Object | null>(initialUser);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      // this should only happen in developent
      async function authenticateWithUrlToken(token: string) {
        const user = await fetchUserBackend({ token });
        if (user) {
          setUser({ user });
          await setCookieServer({ token: token });
        }
      }
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      if (token) authenticateWithUrlToken(token);
    }
  }, []);
  return <>{children({ user, setUser })}</>;
}

function Router({
  initialPageName,
  user,
  preloadData,
  setUser,
  initialUrlPath,
}: {
  initialPageName: PageName;
  user: Object | null;
  preloadData: any;
  setUser: React.Dispatch<React.SetStateAction<any>>;
  initialUrlPath: string;
}): React.JSX.Element | null {
  const { pageName, path } = usePageMonitor({ initialPath: initialUrlPath });
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
