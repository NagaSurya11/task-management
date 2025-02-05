import {
  createAsyncThunk,
  createSlice,
} from '@reduxjs/toolkit';
import { browserLocalPersistence, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from 'src/app/modules/auth/auth.config';
import { taskViewActions } from '../task-view/task-view.slice';


export const AUTH_FEATURE_KEY = 'auth';

interface ProviderData {
  providerId: string;
  uid: string;
  displayName: string;
  email: string;
  phoneNumber: string | null;
  photoURL: string;
}

interface StsTokenManager {
  refreshToken: string;
  accessToken: string;
  expirationTime: number;
}

export interface AuthUser {
  uid: string;
  email: string;
  emailVerified: boolean;
  displayName: string;
  isAnonymous: boolean;
  photoURL: string;
  providerData: ProviderData[];
  stsTokenManager: StsTokenManager;
  createdAt: string;
  lastLoginAt: string;
  apiKey: string;
  appName: string;
}

export interface AuthState {
  user?: AuthUser;
  isLoading: boolean;
}



export const initialAuthState: AuthState = {
  isLoading: true,
};

const createUserIfNotExists = async () => {
  const user = auth.currentUser;
  if (!user) return;

  const userRef = doc(db, "users", user.uid);

  try {
    const userDocSnapshot = await getDoc(userRef);

    if (!userDocSnapshot.exists()) {
      await setDoc(userRef, {});
    }
  } catch (error) {
    console.error("Error handling user document:", error);
  }
};


export const initAuth = createAsyncThunk(
  `${AUTH_FEATURE_KEY}/fetchStatus`,
  async () => {
    try {
      await auth.setPersistence(browserLocalPersistence);
      const response = await signInWithPopup(auth, googleProvider);
      await createUserIfNotExists();
      return response.user.toJSON() as AuthUser;
    } catch (error) {
      console.error('Google login error:', error);
      return null;
    }
  }
);


export const checkForAuth = createAsyncThunk(
  `${AUTH_FEATURE_KEY}/checkForAuth`,
  () => {
    return new Promise<AuthUser | null>(resolve => {
      auth.onAuthStateChanged(async (user) => {
        resolve(user?.toJSON() as AuthUser);
        await createUserIfNotExists();
      })
    })
  }
);

export const logoutUser = createAsyncThunk(
  `${AUTH_FEATURE_KEY}/logoutUser`,
  async (_, { dispatch }) => {
    auth.signOut().then(() => {
      dispatch(authActions.resetAuthState());
      dispatch(taskViewActions.resetTaskViewState());
    });
  }
);

export const authSlice = createSlice({
  name: AUTH_FEATURE_KEY,
  initialState: initialAuthState,
  reducers: {
    resetAuthState: (state) => {
      state.isLoading = false;
      state.user = undefined;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(initAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        if (!!action.payload) {
          state.user = action.payload;
        }

      })
      .addCase(checkForAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkForAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        if (!!action.payload) {
          state.user = action.payload;
        }
      })
  },
});

export const authReducer = authSlice.reducer;
export const authActions = authSlice.actions;

export const selectAuthIsLoading = (state: { auth: AuthState }) =>
  state.auth.isLoading;

export const selectUserName = (state: { auth: AuthState }) =>
  state.auth?.user?.displayName ?? '';

export const selectProfilePic = (state: { auth: AuthState }) =>
  state.auth?.user?.photoURL ?? 'assets/mock/profile-pic.svg';

export const selectUserId = (state: { auth: AuthState }) =>
  state.auth?.user?.uid;