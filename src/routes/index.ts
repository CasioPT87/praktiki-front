import Home from "../pages/home";
import Login from "../pages/login";
import { Routes } from "../types";
import VideoConversation from "../components/functional/videoConversation";
import Register from "../pages/register";
import ChatRoom from "../pages/localChatRoom";

const routes: Routes = {
  home: {
    path: "/",
    pageComponent: Home,
    isHome: true,
  },
  login: {
    path: "/login",
    pageComponent: Login,
  },
  register: {
    path: "/user/register",
    pageComponent: Register,
  },
  locationChatRoom: {
    path: "/location-chat/:id",
    pageComponent: ChatRoom,
  },
};

export default routes;
