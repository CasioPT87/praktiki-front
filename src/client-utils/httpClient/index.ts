import {
    createCustomError,
    getResponseData,
    CustomError,
    AbortError,
    AbstractError,
  } from "./responseManager";
  import {
    RequestOptions,
    Method,
    ErrorData,
    Payload,
  } from "../../types";
  
  interface BuildResponse {
    ok: boolean;
    data: object | string | number | null;
    message: ErrorData | null;
  }
  
  class HttpClient {
    private controller: AbortController = new AbortController();
    private baseUrl: string | undefined = process.env.BACKEND_URL as string;
  
    constructor(baseUrl?: string) {
      this.baseUrl = baseUrl;
    }
  
    get(endpoint: string, options?: RequestOptions): Promise<any> {
      return this.request("GET", endpoint, options);
    }
  
    post(endpoint: string, options?: RequestOptions): Promise<any> {
      return this.request("POST", endpoint, options);
    }
  
    put(endpoint: string, options?: RequestOptions): Promise<any> {
      return this.request("PUT", endpoint, options);
    }
  
    delete(endpoint: string, options?: RequestOptions): Promise<any> {
      return this.request("DELETE", endpoint, options);
    }
  
    private async request(
      method: Method,
      endpoint: string,
      { headers, queryParams, body }: RequestOptions = {},
    ): Promise<BuildResponse> {
      let response;
      let responseData = null;
      try {
        const url = this.buildUrl(endpoint, queryParams);
        const token = HttpClient.getToken();
        const signal = this.controller.signal;
        const options = {
          method,
          headers: {
            "Content-Type": "application/json",
            credentials: 'include',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...headers,
          },
          body: body ? JSON.stringify(body) : null,
          signal,
        };
        response = await fetch(url, options);
        responseData = await getResponseData({
          isOk: response.ok,
          response,
        });
  
        return this.buildResponse({ responseData });
      } catch (e: any) {
        return this.buildResponse({ e, response, responseData });
      }
    }
  
    private buildResponse({
      e,
      response,
      responseData,
    }: {
      e?: AbstractError;
      response?: Response;
      responseData: Payload | null;
    }): BuildResponse {
      // 1 -  todo salio bien
      if (!!responseData && !e) {
        return {
          ok: true,
          data: responseData,
          message: null,
        };
        // 2 - la request no fue satisfactoria:
        // 2.1 - error de backend controlado (404, apiResponse con status === 0), ese tipo de cosas
      } else if (e && e instanceof CustomError) {
        return {
          ok: false,
          data: null,
          message: e.toastData,
        };
      } else if (e) {
        let error;
        // 2.2 - somos nosotros los que hemos abortado la request
        if (e.name === "AbortError") {
          error = new AbortError("AbortError");
        }
        // 2.3 - poco probable, pero por tener todos los casos
        else if (response && responseData) {
          error = createCustomError({ response, responseData });
        }
        // 2.4 - cd es un error sin controlar (un error en el codigo, timeout, request a un dominio inexistente, CORS...)
        else {
          error = createCustomError({
            response: { status: 500 } as Response,
            responseData: "",
          });
        }
        return {
          ok: false,
          data: null,
          message: error.toastData,
        };
      } else {
        // 2.5 - cd no hay respuesta y tampoco error. No deberia pasar nunca
        return {
          ok: false,
          data: null,
          message: null,
        };
      }
    }
  
    private buildUrl(
      endpoint: string,
      queryParams?: Record<string, any>,
    ): string {
      const url = new URL(endpoint, this.baseUrl);
  
      if (queryParams) {
        Object.keys(queryParams).forEach((key) =>
          url.searchParams.append(key, queryParams[key]),
        );
      }
  
      return url.toString();
    }
  
    abort(): void {
      if (this.controller) {
        this.controller.abort();
      } else {
        console.log("No hay solicitud activa para abortar");
      }
    }
  
    static getToken(): string | null {
      const tokenKey = process.env.APP_NAME as string;
      return process.env.NODE_ENV === "development"
        ? localStorage.getItem(tokenKey)
        : null;
    }
  }
  
  export default HttpClient;
  