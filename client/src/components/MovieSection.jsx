import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

import ItemCard from './ItemCard';

import { useAppContext } from '../contexts/AppContext';
import Loading from './Loading';

const MovieSection = () => {
    const [movies, setMovies] = useState([]);
    
    const navigate = useNavigate();
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
        <div className = 'px-6 md:px-16 lg:px-24 xl:px-44 overflow-hidden'>
            <div className = 'relative flex items-center justify-between pt-20'>
                <p className = 'text-white font-medium text-xl'>Movies</p>
                <button onClick = { () => navigate('/movies') } className = 'group flex items-center gap-2 text-sm text-gray-300 cursor-pointer'>
                    View all <ArrowRight className = 'group-hover:translate-x-0.5 transition w-4.5 h-4.5'/>
                </button>
            </div>
            {isLoading ? (
                <Loading/>
            ) : (
                movies.length > 0 ? (
                    <>
                        <div className = 'flex flex-wrap max-sm:justify-center gap-8 mt-8'>
                            {movies.slice(0, 4).map((movie, index) => (
                                <ItemCard key = { index } item = { movie } link = 'movies'/>
                            ))}
                        </div>
                        <div className = 'flex justify-center mt-10'>
                            <button onClick = { () => {navigate('/movies'); scrollTo(0, 0);} } className = 'px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer'>Show more</button>
                        </div>
                    </>
                ) : (
                    <p className = 'text-gray-400'>No movies avaiable</p>
                )
            )}
        </div>
    );
}

export default MovieSection;