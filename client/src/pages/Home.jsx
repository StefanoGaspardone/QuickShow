import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

import FeaturedSection from '../components/FeaturedSection';
import HeroSection from '../components/HeroSection';

import { useAppContext } from '../contexts/AppContext';

const Home = () => {
    const [movies, setMovies] = useState([]);
    const { axios, getToken } = useAppContext();
    
    useEffect(() => {
        const getMovies = async () => {
            try {
                const { data } = await axios.get('/api/movies', {
                    headers: { Authorization: `Bearer ${await getToken()}` }
                });

                if(data.success) setMovies(data.movies);
                else toast.error(data.message);
            } catch(error) {
                console.log(error);
                toast.error(error.message);
            }
        }

        getMovies();
    }, []);

    return (
        <>
            <HeroSection/>
            <FeaturedSection movies = { movies }/>
        </>
    );
}

export default Home;