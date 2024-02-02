import { configureStore }  from '@reduxjs/toolkit';
import  {flightsApi } from './apis/flightsApi';
import { setupListeners } from '@reduxjs/toolkit/query';

const store = configureStore({
	reducer: {
		[flightsApi.reducerPath]: flightsApi.reducer,
	},
	middleware: (getDefaultMiddleware) => {
		return getDefaultMiddleware().concat(flightsApi.middleware);
	}
	
});

setupListeners(store.dispatch);

export  { store };
export { useGetFlightsQuery} from './apis/flightsApi';

