import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

import ItemCard from '../components/ItemCard';
import BlurCircle from '../components/BlurCircle';
import Loading from '../components/Loading';

import { useAppContext } from '../contexts/AppContext';

const Movies = () => {
    const [movies, setMovies] = useState([]);
    const { axios, getToken, setIsLoading, isLoading } = useAppContext();
    
    useEffect(() => {
        const getMovies = async () => {
            try {
                setIsLoading(true);

                const { data } = await axios.get('/api/movies', {
                    headers: { Authorization: `Bearer ${await getToken()}` }
                });

                if(data.success) setMovies(data.movies);
                else toast.error(data.message);
            } catch(error) {
                console.log(error);
                toast.error(error.message);
            } finally {
                setIsLoading(false);
            }
        }

        getMovies();
    }, []);

    return (
        isLoading ? (
            <Loading/>
        ) : (
            movies.length > 0 ? (
                <div className = 'relative mt-40 px-5 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-[80vh]'>
                    <BlurCircle top = '150px' left = '0px'/>
                    <BlurCircle bottom = '100px' right = '50px'/>
                    <div className = 'flex flex-wrap max-sm:justify-center gap-8'>
                        {movies.map((movie, index) => (
                            <ItemCard key = { index } item = { movie } link = 'movies'/>
                        ))}
                    </div>
                </div>
            ) : (
                <div className = 'flex flex-col items-center justify-center h-screen'>
                    <BlurCircle top = '150px' left = '0px'/>
                    <BlurCircle bottom = '50px' right = '50px'/>
                    <h1 className = 'text-3xl font-bold text-center'>No movies available</h1>
                </div>
            )
        )
    );
}

export default Movies;