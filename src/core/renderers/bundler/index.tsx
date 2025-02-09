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
import { fetchUserBackend } from "../../../client-utils";
import { setUpStore } from "../../../store";
import { createMarkup } from "../utils";

const domNode = document.getElementById("app") as Element;
const { pathname: path } = window.location;

if (process.env.NODE_ENV === "production") {
  const store = setUpStore(window.__PRELOADED_STATE__);
  const preloadData = window.__PRELOADED_DATA__;
  const user = window.__PRELOADED_USER__;

  // Allow all this data to be garbage collected
  delete window.__PRELOADED_STATE__;
  delete window.__PRELOADED_DATA__;
  delete window.__PRELOADED_USER__;

  const { page } = getAllowedPage({ path, userIsLogged: !!user });

  hydrateRoot(
    domNode,
    createMarkup({
      page,
      store,
      user,
      preloadData,
    }),
  );
} else {
  (async function createFrontComponentsDev() {
    const store = setUpStore();
    const localstorageToken = localStorage.getItem(process.env.APP_NAME || '');
    const token = localstorageToken || null
    console.log({ token })
    const user = await fetchUserBackend({ token });

    console.log({ user })

    const { page } = getAllowedPage({ path, userIsLogged: !!user }); // devuelve la pagina para ese path (si esta autorizada, si no, una pagina segura)
    const { path: newPath } = getPageValueFromPage({ page });

    if (newPath !== path) window.location.href = newPath;

    getInitialRenderData({ page, token: null }).then((preloadData) => {
      const root = createRoot(domNode);

      root.render(
        createMarkup({
          page,
          store,
          user,
          preloadData,
        }),
      );
    });
  })();
}
