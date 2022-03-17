// @flow
import * as React from 'react';
import { Home } from './views/home';
import { HashRouter } from 'react-router-dom';
import { Route, Routes } from 'react-router';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { playerSlice } from './store/reducers/player.reducer';
import thunk from 'redux-thunk';

const store = configureStore({
	reducer: {
		player: playerSlice.reducer
	},
	middleware: (getDefaultMiddleware) => {
		return [...getDefaultMiddleware(), thunk];
	}
});

export function App() {
	return (
		<>
			<Provider store={store}>
				<HashRouter>
					<Routes>
						<Route path={''} element={<Home />} />
					</Routes>
				</HashRouter>
			</Provider>
		</>
	);
}
