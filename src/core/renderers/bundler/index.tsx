/* todo este codigo se ejecuta en el browser
   - cuando estamos en produccion: antes se ha ejecutado (en el servidor del front) una funcion
   en el archivo bundler/initial que crea una copia exacta de lo que vamos a crear en este archivo
   - cuando estamos en desarrollo: no se ejecuta nada antes en el servidor del front. este es el archivo de 
   entrada para webpack-dev-server, dibuja los componentes y pa'lante
*/

import { createRoot, hydrateRoot } from "react-dom/client";
import {
  getAllowedPage,
  getInitialRenderData,
  getPageValueFromPage,
} from "../../../tools";
import { fetchUserBackend, setCookieServer } from "../../../client-utils";
import { setUpStore } from "../../../store";
import { createMarkup } from "../utils";

const domNode = document.getElementById("app") as Element;
const { pathname: urlPath } = window.location;

if (process.env.NODE_ENV === "production") {
  const store = setUpStore(window.__PRELOADED_STATE__);
  const preloadData = window.__PRELOADED_DATA__;
  const user = window.__PRELOADED_USER__;

  // Allow all this data to be garbage collected
  delete window.__PRELOADED_STATE__;
  delete window.__PRELOADED_DATA__;
  delete window.__PRELOADED_USER__;

  const { page } = getAllowedPage({ path: urlPath, userIsLogged: !!user });

  hydrateRoot(
    domNode,
    createMarkup({
      page,
      store,
      user,
      preloadData,
      initialUrlPath: urlPath,
    }),
  );
} else {
  (async function createFrontComponentsDev() {
    let user: Record<string, any> | null = null;

    const store = setUpStore();
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get("token");
    const localStorageKey = process.env.PORTAL_SUFIX as string;
    const localStorageToken = localStorage.getItem(localStorageKey);
    if (urlToken || localStorageToken) {
      const token = urlToken || localStorageToken;
      user = await fetchUserBackend({ token });
      if (token) setCookieServer({ token });
    }

    if (!user) user = await fetchUserBackend({ token: null });

    const { page, needsRedirection } = getAllowedPage({
      path: urlPath,
      userIsLogged: !!user,
    }); // devuelve la pagina para ese path (si esta autorizada, si no, una pagina segura)

    if (needsRedirection) {
      const { path: homePath } = getPageValueFromPage({ page });
      window.location.href = homePath;
      return;
    }

    getInitialRenderData({ page, token: null }).then((preloadData) => {
      const root = createRoot(domNode);

      root.render(
        createMarkup({
          page,
          store,
          user,
          preloadData,
          initialUrlPath: urlPath,
        }),
      );
    });
  })();
}
