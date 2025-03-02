import React from 'react';
import {
  RootState,
  Action,
  Reducer,
  AppDispatch,
  Store,
  AppThunk,
  AppThunkDispatch,
} from './store';

type PageName = 'home' | 'profile' | 'articles' | 'login' | 'messages' | 'conversation' | 'register';

type PageComponent = React.FC<any> & {
  preloadFn?: (token: string | null) => () => any;
};

interface PageValue {
  path: string;
  pageComponent: PageComponent;
  isHome?: boolean;
}

type Page = {
  [key in PageName]: PageValue;
} & {
  [key: string]: never; // Ensure no extra properties are allowed
};

type Routes = {
  [key in PageName]: PageValue;
};

type PlainObject = { [key: string]: unknown } & object;

type User = {
  id: number; // Primary key, auto-incrementing
  name: string;
  role_id: number; // Foreign key referencing 'role.id'
  created_at: Date; // Timestamp for creation
  updated_at: Date; // Timestamp for last update
  deleted_at: Date | null; // Nullable timestamp for soft deletion
};

export type RequestOptions = {
  headers?: HeadersInit;
  queryParams?: Record<string, any>;
  body?: Record<string, any>;
  showHttpErrors?: boolean;
};

export type Method = "GET" | "POST" | "PUT" | "DELETE";

export type ErrorData = {
  message: string;
  title: string;
  type: "ALERT" | "WARNING" | "INFO";
};

export type ResponsePayload = object | string | number | any[] | CustomResponse;
export type Payload = object | string | number | any[];

export type CustomResponse = {
  isCustomResponse: true;
  status: 0 | 1;
  message: string;
  data: Payload;
  errors: string[];
};

export type ClientMessage = {
  message: string;
  type: "ERROR" | "WARNING" | "SUCCESS";
};


export {
  PageName,
  PageValue,
  Page,
  Routes,
  RootState,
  AppDispatch,
  AppThunk,
  AppThunkDispatch,
  Action,
  Reducer,
  Store,
  PageComponent,
  PlainObject,
  User
};
