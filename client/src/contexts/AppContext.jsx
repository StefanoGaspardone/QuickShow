import { createContext, useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from 'react-router';
import axios from 'axios';
import { useAuth, useUser } from '@clerk/clerk-react';
import { toast } from 'react-hot-toast';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [shows, setShows] = useState([]);
    const [favoriteMovies, setFavoriteMovies] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const image_base_url = import.meta.env.VITE_TMDB_IMAGE_BASE_URL;
    const tmdb_key = import.meta.env.VITE_TMDB_API_KEY;

    const { user } = useUser();
    const { getToken } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const fetchShows = async () => {
        try {
            const { data } = await axios.get('/api/shows');

            if(data.success) setShows(data.shows);
            else toast.error(data.message);

            console.log('Shows: ' + data.shows);
        } catch(error) {
            console.log(error);
        }
    }
    
    const fetchIsAdmin = async () => {
        try {
            const { data } = await axios.get('/api/admin/is-admin', {
                headers: { Authorization: `Bearer ${await getToken()}` }
            });
            setIsAdmin(data.isAdmin);

            if(!data.isAdmin && location.pathname.startsWith('/admin')) {
                navigate('/');
                toast.error('You are not authorized to access admin dashboard');
            }
        } catch(error) {
            console.log(error);
        }
    }

    const fetchFavoritesMovies = async () => {
        try {
            const { data } = await axios.get('/api/user/favorites', {
                headers: { Authorization: `Bearer ${await getToken()}` }
            });

            if(data.success) setFavoriteMovies(data.movies);
            else toast.error(data.message);
        } catch(error) {
            console.log(error);
        }
    }

    useEffect(() => {
        fetchShows();
    }, []);

    useEffect(() => {
        if(user) {
            fetchIsAdmin();
            fetchFavoritesMovies();
        }
    }, [user]);

    return (
        <AppContext.Provider value = {{ axios, fetchIsAdmin, user, getToken, navigate, isAdmin, shows, favoriteMovies, fetchFavoritesMovies, image_base_url, tmdb_key, isLoading, setIsLoading }}>
            { children }
        </AppContext.Provider>
    );
}

export const useAppContext = () => useContext(AppContext);