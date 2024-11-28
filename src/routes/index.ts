import Home from "../pages/home";
import Profile from "../pages/profile";
import Login from "../pages/login";
import { Routes } from "../types";
import Articles from "../pages/articles";
import Messages from '../pages/messages'

const routes: Routes = {
  home: {
    path: "/",
    pageComponent: Home,
    isHome: true,
  },
  profile: {
    path: "/profile",
    pageComponent: Profile,
  },
  articles: {
    path: "/articles",
    pageComponent: Articles,
  },
  login: {
    path: "/login",
    pageComponent: Login,
  },
  messages: {
    path: "/messages",
    pageComponent: Messages,
  },
};

export default routes;
