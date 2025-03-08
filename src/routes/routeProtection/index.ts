import { PageValue } from '../../types';

interface ProtectedPaths {
  regExps: RegExp[];
  paths: Array<PageValue['path']>;
}

const protectedPaths: ProtectedPaths = {
  regExps: [new RegExp('/forbidden')],
  paths: ['/location-chat'],
};

const isPrivateRoute = ({ path }: { path: PageValue['path'] }): boolean => {
  if (
    protectedPaths.paths.includes(path) ||
    protectedPaths.regExps.some((regex) => regex.test(path))
  ) {
    return true;
  }
  return false;
};

export { isPrivateRoute };
