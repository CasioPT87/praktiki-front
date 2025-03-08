import routes from '../routes';
import { match } from "path-to-regexp";
import { isPrivateRoute } from '../routes/routeProtection';
import { PageValue, Page, PageName, PageComponent, UrlParams } from '../types';

const getPageFromPath = ({ path }: { path: PageValue["path"] }): Page => {
  const pageTuple = Object.entries(routes).find(([, value]) => {
    const matches = match(value.path)(path);
    return !!matches;
  }) as [PageName, PageValue];

  if (!pageTuple) {
    return getPageFromPageName({ pageName: "home" }) as Page;
  }
  const page = Object.fromEntries([pageTuple]) as Page;
  return page;
};
const getPageNameFromPage = ({ page }: { page: Page }): PageName => {
  const pageNameArray = Object.keys(page) as Array<PageName>;
  if (pageNameArray.length !== 1)
    throw new Error('Page name not calculated correctly');
  return pageNameArray[0];
};

const getPageFromPageName = ({ pageName }: { pageName: PageName }): Page => {
  const pageValue = routes[pageName];
  const page = {
    [pageName]: pageValue,
  } as Page;
  return page;
};

const pageDoesNotNeedUser = ({ page }: { page: Page }) => {
  const pageName = getPageNameFromPage({ page })
  return ['login', 'register'].includes(pageName) 
}

const getAllowedPage = ({
  path,
  userIsLogged,
}: {
  path: PageValue["path"];
  userIsLogged: boolean;
}): { page: Page; needsRedirection: boolean; urlParams: UrlParams | null } => {
  if (isPrivateRoute({ path }) && !userIsLogged) {
    return { page: getHomePage(), needsRedirection: true, urlParams: null };
  } else {
    const page = getPageFromPath({ path });
    const pageValue = getPageValueFromPage({ page });
    const urlParams = match(pageValue.path)(path) as UrlParams;
    return {
      page: getPageFromPath({ path }),
      needsRedirection: false,
      urlParams,
    };
  }
};

const getAllRoutes = (): Array<Pick<PageValue, "path">["path"]> => {
  return Object.values(routes).map(({ path }) => path);
};

const getInitialRenderData = async ({
  page,
  token = null,
}: {
  page: Page;
  token: string | null;
}): Promise<any> => {
  const pageValue = getPageValueFromPage({ page });
  const component = pageValue.pageComponent;
  if (component?.preloadFn) {
    return await component.preloadFn(token)();
  }
  return null;
};

const getHomePage = (): Page => {
  const pageTuple = Object.entries(routes).find(([key, value]) => {
    return value.isHome;
  }) as [PageName, PageValue];
  const page = Object.fromEntries([pageTuple]) as Page;
  return page;
};

const getPageValueFromPage = ({ page }: { page: Page }): PageValue => {
  return Object.values(page)[0];
};

export {
  getPageFromPath,
  getAllRoutes,
  getInitialRenderData,
  getHomePage,
  getAllowedPage,
  getPageNameFromPage,
  getPageValueFromPage,
  pageDoesNotNeedUser
};
