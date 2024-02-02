import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const flightsApi = createApi({
	reducerPath: 'flights',
	baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:3005',
		fetchFn: async (...args) => {
			return fetch(...args);
		}
	}),
	endpoints:(builder) => {
		return {
			getFlights: builder.query({
			  query: () => {
				return {
				  url: '/flights',
				  method: 'GET',
				};
			  },
				providesTags: ['Flights']
			}),
		};	
},
});



export const { 
	useGetFlightsQuery
} = flightsApi;
export  { flightsApi };