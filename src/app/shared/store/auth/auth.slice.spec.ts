import { fetchAuth, authAdapter, authReducer } from './auth.slice';

describe('auth reducer', () => {
  it('should handle initial state', () => {
    const expected = authAdapter.getInitialState({
      loadingStatus: 'not loaded',
      error: null,
    });

    expect(authReducer(undefined, { type: '' })).toEqual(expected);
  });

  it('should handle fetchAuth', () => {
    let state = authReducer(undefined, fetchAuth.pending(''));

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'loading',
        error: null,
        entities: {},
        ids: [],
      })
    );

    state = authReducer(state, fetchAuth.fulfilled([{ id: 1 }], ''));

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'loaded',
        error: null,
        entities: { 1: { id: 1 } },
        ids: [1],
      })
    );

    state = authReducer(state, fetchAuth.rejected(new Error('Uh oh'), ''));

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'error',
        error: 'Uh oh',
        entities: { 1: { id: 1 } },
        ids: [1],
      })
    );
  });
});
