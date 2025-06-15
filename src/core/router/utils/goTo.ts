import { compile } from "path-to-regexp";
import routes from "../../../routes";
import { PageName as PageNameType } from "../../../types";
import { useContext } from "react";
import { MessagesSocketContext } from "../../../contexts";
import { Socket } from "socket.io-client";

const goTo = ({
  pageName,
  urlParams,
  pushHistoryState = true,
  redirect = false,
}: {
  pageName: PageNameType;
  urlParams?: { [key: string]: string };
  pushHistoryState?: boolean;
  redirect?: boolean;
}): void => {
  if (typeof document !== "undefined") {
    const pageValue = routes[pageName];

    const path = urlParams
      ? compile(pageValue.path)(urlParams)
      : pageValue.path;
    const _path = path as string;

    if (!_path) return;

    if (pushHistoryState) {
      // @ts-ignore: Unreachable code error
      window.history.pushState(null, null, _path);
    } else if (redirect) {
      window.location.replace(_path);
    }
    const changePageEvent = new CustomEvent("changePage", {
      detail: { path: _path },
    });

    window.dispatchEvent(changePageEvent);
  }
};

export default goTo;