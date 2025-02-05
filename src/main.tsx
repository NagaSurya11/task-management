import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';

import App from './app/app';

import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

import {
  TASK_VIEW_FEATURE_KEY,
  taskViewReducer,
} from './app/shared/store/task-view/task-view.slice';

import {
  AUTH_FEATURE_KEY,
  authReducer,
} from './app/shared/store/auth/auth.slice';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

export const store = configureStore({
  reducer: {
    [AUTH_FEATURE_KEY]: authReducer,
    [TASK_VIEW_FEATURE_KEY]: taskViewReducer
  },
  // Additional middleware can be passed to this array
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
  devTools: process.env.NODE_ENV !== 'production',
  // Optional Redux store enhancers
  enhancers: [],
});

root.render(
  <Provider store={store}>
    <StrictMode>
      <App />
    </StrictMode>
  </Provider>
);

export type AppDispatch = typeof store.dispatch;
