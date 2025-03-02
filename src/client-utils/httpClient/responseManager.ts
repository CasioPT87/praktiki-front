import {
  ErrorData,
  ResponsePayload,
  Payload,
  CustomResponse,
} from '../../types/httpClientTypes';

export abstract class AbstractError extends Error {
  abstract get toastData(): ErrorData;
}

export class AbortError extends AbstractError {
  constructor(message: string) {
    super(message);
  }

  get toastData(): ErrorData {
    return {
      message: this.message,
      title: 'la request fue abortada (traducir)',
      type: 'ALERT',
    };
  }
}

type CustomErrorData = {
  httpStatusCode: number;
  errors: string[];
  payload: Payload;
};

export class CustomError extends AbstractError {
  private _data: CustomErrorData;

  constructor(message: string, data: CustomErrorData) {
    super(message);
    this._data = data;
  }

  get data(): CustomErrorData {
    return this._data;
  }

  set data(data: CustomErrorData) {
    this._data = data;
  }

  get toastData(): ErrorData {
    // LA LOGICA QUE SEA
    return {
      message: 'message',
      title: 'mi titulo',
      type: 'ALERT',
    };
  }
}

export const createCustomError = ({
  message = 'error',
  response,
  responseData,
}: {
  message?: string;
  response: Response;
  responseData: Payload | CustomResponse;
}): CustomError => {
  const errors =
    typeof responseData === 'object' && 'errors' in responseData
      ? responseData.errors
      : [];
  return new CustomError(message, {
    httpStatusCode: response.status,
    errors: errors,
    payload: responseData,
  });
};

export async function getResponseData({
  isOk,
  response,
}: {
  isOk: boolean;
  response: Response;
}): Promise<Payload | null> {
  const responseData = await getResponseDataBasedOnContentType({
    response,
  });

  if (responseData === null) return null;

  if (!isOk) {
    throw createCustomError({ response, responseData });
  } else {
    return responseData;
  }
}

async function getResponseDataBasedOnContentType({
  response,
}: {
  response: Response;
}): Promise<ResponsePayload | null> {
  if (response.status === 204) {
    return null;
  } else {
    const contentType = (await response.headers.get('Content-Type')) || '';
    const getTextData = async () => await response.text();
    const getJSONData = async () => await response.json();
    const getBlobData = async () => await response.blob();

    switch (true) {
      case contentType.includes('application/json'):
        return await getJSONData();
      case contentType.includes('text/html'):
      case contentType.includes('text/plain'):
        return await getTextData();
      case contentType.includes('application/xml'):
      case contentType.includes('text/xml'):
        const type = contentType.includes('application')
          ? 'application/xml'
          : 'text/xml';
        const parser = new DOMParser();
        return parser.parseFromString(await getTextData(), type);
      default:
        return getBlobData();
    }
  }
}
