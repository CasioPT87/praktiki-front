require("dotenv").config(); // eslint-disable-line no-undef

import express, { Request, Response, NextFunction } from "express";
import { getPageValueFromPage } from "./tools/pages";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import initial from "./core/renderers/initial";
import { getAllRoutes, getAllowedPage } from "./tools";
import { getUser } from "./core/server-utils";
import { getToken } from "./core/server-utils/authorization";

const PORT = 9990;
const app = express();

// Serve static files
app.use(express.static(path.join(process.cwd(), "./src/dist")));

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production" ? true : "http://localhost:8090", // true means same origin
    credentials: true, // Allow cookies to be sent
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Middleware to catch errors in async middleware/handlers
const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => any) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

type SameSite = "none" | "strict"; // Define a type for allowed values
const sameSiteValue: SameSite =
  process.env.NODE_ENV === "development" ? "none" : "strict";

const COOKIE = {
  httpOnly: true, // disables js being able to read the cookie
  secure: process.env.NODE_ENV === "development" ? false : true, // cookie is sent only through https?
  sameSite: sameSiteValue, // so cookie is not sent to third-party apps
};

app.delete(
  "/cookies",
  asyncHandler(async (req: Request, res: Response) => {
    res.clearCookie(process.env.APP_NAME || "", {
      ...COOKIE,
    });

    return res.json({
      success: true,
    });
  }),
);

// esto existe para ser llamado desde el browser. porque? explicacion:
// cuando el browser se loguea con usuario y contrasena, coge el token del apiGateway (el token del apiGateway)
// cogemos ese mismo token y lo seteamos como cookie para el front.
// de esa forma, cuando el usuario vuelva a entrar en la pagina (teniendo la cookie de geNext, con el token de apiGateway),
// puede coger el token y asi coger el usuario de apiGateway en el servidor del front, que lo utilizara tanto para el primer renderizado (SSR)
// como para el hidratado
// y porque no hacemos esto en el js que corre en browser? el browser podria crear modificar estas cookies con js (y nos podriamos ahorrar esta
// llamada, simplemente haciendolo en el codigo corriendo en el broswer)
// PEEEERO nosotros queremos cookies con el maximo de seguridad, que no puedan ser modificadas por js asi que lo hacemos en el servidor del front.
// (el js corriendo en el brower con puede crear cookies con el atributo httpOnly: true)
app.post(
  "/cookies",
  asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.body;
    if (token) {
      res.cookie(process.env.APP_NAME || "", token, {
        ...COOKIE,
        maxAge: 8 * 60 * 60 * 1000, // 8 horas
      });
    }

    return res.json({
      success: !!token,
    });
  }),
);

// All allowed routes
app.get(
  getAllRoutes(),
  asyncHandler(async (req: Request, res: Response) => {
    // cuando se produce la primera carga (y recuerda que esta funcion solo se usa en prod), se recibe aqui una request. si esa request tiene el token (ya sea en las cookies o en el header o en la url)
    // es importante que lo cojamos, porque lo podemos necesitar para el preloadData del renderizado SSR (el preloadData puede que necesite el token, si esta llamando a apiGateway) y
    // tambien para ver si podemos renderizar una pagina que puede ser privada
    const token = getToken({ req });

    if (token) {
      const user = await getUser({ token });
      if (user) {
        req.user = user;
        req.token = token;
      } else {
        res.clearCookie(process.env.APP_NAME || "", {
          ...COOKIE,
        });
      }
    }
    //////////////////////////////////////////////////

    const path = req.path;
    const { page, needsRedirection } = getAllowedPage({
      path,
      userIsLogged: !!req.user,
    });

    if (needsRedirection) {
      const pageValue = getPageValueFromPage({ page });
      return res.redirect(301, pageValue.path);
    }

    await initial({ response: res, request: req, page });
  }),
);

app.all("*", (req: Request, res: Response) => {
  return res.status(404);
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send("Place 500 error here or something");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running here: http://localhost:${PORT}`);
});
