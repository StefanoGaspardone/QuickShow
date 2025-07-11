import { Routes, Route, useLocation, Navigate } from 'react-router';
import { Toaster } from 'react-hot-toast';
import { SignIn } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Loading from './components/Loading';

import Home from './pages/Home';
import Movies from './pages/Movies';
import MovieDetails from './pages/MovieDetails';
import SeatLayout from './pages/SeatLayout';
import MyBookings from './pages/MyBookings';
import Favorites from './pages/Favorites';
import Layout from './pages/admin/Layout';
import Dashboard from './pages/admin/Dashboard';
import AddShows from './pages/admin/AddShows';
import ListShows from './pages/admin/ListShows';
import ListBookings from './pages/admin/ListBookings';
import AddMovie from './pages/admin/AddMovie';
import ListMovies from './pages/admin/ListMovies';
import AddTvSeries from './pages/admin/AddTvSeries';
import ListTvSeries from './pages/admin/ListTvSeries';
import Serie from './pages/Serie';
import SerieDetails from './pages/SerieDetails';
import NotFound from './pages/NotFound';

import { useAppContext } from './contexts/AppContext';

const App = () => {
	const [isAdminRoute, setIsAdminRoute] = useState(false);

	const location = useLocation();
	const { user } = useAppContext();

	useEffect(() => {
		setIsAdminRoute(location.pathname.startsWith('/admin'));
		scrollTo(0, 0);
	}, [location.pathname]);

	return (
		<>
			<Toaster/>
			{!isAdminRoute && <Navbar/>}
			<Routes>
				<Route path = '/' element = { <Home/> }/>
				<Route path = '/movies' element = { <Movies/> }/>
				<Route path = '/movies/:id' element = { <MovieDetails/> }/>
				<Route path = '/movies/:id/:date' element = { <SeatLayout/> }/>
				<Route path = '/series' element = { <Serie/> }/>
				<Route path = '/series/:id' element = { <SerieDetails/> }/>
				<Route path = '/my-bookings' element = { <MyBookings/> }/>
				<Route path = '/loading/:nextUrl' element = { <Loading/> }/>
				<Route path = '/favorites' element = { user ? <Favorites/> : <Navigate to = '/' replace = { true }/> }/>
				<Route path = '/admin/*' element = { user ? <Layout/> : (
					<div className = 'min-h-screen flex justify-center items-center'>
						<SignIn fallbackRedirectUrl = '/admin'/>
					</div>
				) }>
					<Route index element = { <Dashboard/> }/>
					<Route path = 'movies/new' element = { <AddMovie/> }/>
					<Route path = 'movies' element = { <ListMovies/> }/>
					<Route path = 'series/new' element = { <AddTvSeries/> }/>
					<Route path = 'series' element = { <ListTvSeries/> }/>
					<Route path = 'shows/new' element = { <AddShows/> }/>
					<Route path = 'shows' element = { <ListShows/> }/>
					<Route path = 'bookings' element = { <ListBookings/> }/>
				</Route>
				<Route path = '*' element = { <NotFound/> }/>
			</Routes>
			{!isAdminRoute && <Footer/>}
		</>
	);
}

export default App;