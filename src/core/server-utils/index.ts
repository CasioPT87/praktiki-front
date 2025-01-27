const backendUrl = process.env.BACKEND_URL as string;

export async function fetchUser({
  token,
}: {
  token: string;
}): Promise<Object | null> {
  if (!token) return null
  try {
    // const response = await fetch(backendUrl + backendUserPath, {
    //   method: 'GET',
    //   headers: {
    //     Authorization: `Bearer ${token}`,
    //   },
    // });
    // if (response.ok) {
    //   const { data: user } = await response.json();
    //   return user;
    // }
    return null;
  } catch (e) {
    if (e instanceof Error) {
      console.error(e.stack);
    } else {
      console.error('unknown error');
    }

    return null;
  }
}

export const getUser = async ({
  token,
}: {
  token: string;
}): Promise<Object | null> => {
  try {
    const user = await fetchUser({ token });
    if (!user) return null;
    return user;
  } catch (e) {
    if (e instanceof Error) {
      console.error(e.stack);
    } else {
      console.error('unknown error');
    }

    return null;
  }
};
