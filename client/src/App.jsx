import { Routes, Route, useLocation, Navigate } from 'react-router';
import { Toaster } from 'react-hot-toast';
import { SignIn } from '@clerk/clerk-react';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

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

import { useAppContext } from './contexts/AppContext';

const App = () => {
	const isAdminRoute = useLocation().pathname.startsWith('/admin');
	const { user } = useAppContext();

	return (
		<>
			<Toaster/>
			{!isAdminRoute && <Navbar/>}
			<Routes>
				<Route path = '/' element = { <Home/> }/>
				<Route path = '/movies' element = { <Movies/> }/>
				<Route path = '/movies/:id' element = { <MovieDetails/> }/>
				<Route path = '/movies/:id/:date' element = { <SeatLayout/> }/>
				<Route path = '/my-bookings' element = { <MyBookings/> }/>
				<Route path = '/favorites' element = { user ? <Favorites/> : <Navigate to = '/' replace = { true }/> }/>
				<Route path = '/admin/*' element = { user ? <Layout/> : (
					<div className = 'min-h-screen flex justify-center items-center'>
						<SignIn fallbackRedirectUrl = '/admin'/>
					</div>
				) }>
					<Route index element = { <Dashboard/> }/>
					<Route path = 'shows/new' element = { <AddShows/> }/>
					<Route path = 'shows' element = { <ListShows/> }/>
					<Route path = 'bookings' element = { <ListBookings/> }/>
				</Route>
			</Routes>
			{!isAdminRoute && <Footer/>}
		</>
	);
}

export default App;