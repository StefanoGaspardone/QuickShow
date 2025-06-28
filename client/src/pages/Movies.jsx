import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

import ItemCard from '../components/ItemCard';
import BlurCircle from '../components/BlurCircle';

import { useAppContext } from '../contexts/AppContext';

const Movies = () => {
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

    return movies.length > 0 ? (
        <div className = 'relative my-40 mb-60 px-5 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-[80vh]'>
            <BlurCircle top = '150px' left = '0px'/>
            <BlurCircle bottom = '50px' right = '50px'/>
            <div className = 'flex flex-wrap max-sm:justify-center gap-8'>
                {movies.map((movie, index) => (
                    <MovieCard key = { index } movie = { movie }/>
                ))}
            </div>
        </div>
    ) : (
        <div className = 'flex flex-col items-center justify-center h-screen'>
            <h1 className = 'text-3xl font-bold text-center'>No movies available</h1>
        </div>
    );
}

export default Movies;