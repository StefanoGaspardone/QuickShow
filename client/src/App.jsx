import { Routes, Route, useLocation } from 'react-router';
import { Toaster } from 'react-hot-toast';

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

const App = () => {
	const isAdminRoute = useLocation().pathname.startsWith('/admin');

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
				<Route path = '/favorites' element = { <Favorites/> }/>
				<Route path = '/admin/*' element = { <Layout/> }>
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