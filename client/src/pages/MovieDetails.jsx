import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Heart, PlayCircleIcon, StarIcon } from 'lucide-react';
import dayjs from 'dayjs';

import BlurCircle from '../components/BlurCircle';
import DateSelect from '../components/DateSelect';
import MovieCard from '../components/MovieCard';
import Loading from '../components/Loading';

import { useAppContext } from '../contexts/AppContext';

import timeFormat from '../libs/timeFormat.mjs';
import toast from 'react-hot-toast';

const MovieDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [show, setShow] = useState(null);

    const { axios, shows, user, getToken, fetchFavoritesMovies, favoriteMovies, image_base_url } = useAppContext();

    const handleFavorite = async () => {
        try {
            if(!user) return toast.error('Please login to proceed');

            const { data } = await axios.put('api/user/favorites', { movieId: id }, {
                headers: { Authorization: `Bearer ${await getToken()}` }
            });

            if(data.success) {
                await fetchFavoritesMovies();
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        } catch(error) {
            console.log(error);
            toast.error(error.message);
        }
    }

    useEffect(() => {
        const getShow = async () => {
            try {
                const { data } = await axios.get(`/api/shows/${id}`);

                if(data.success) setShow(data);
                console.log(data.movie);
            } catch(error) {
                console.log(error);
            }
        }

        getShow();
    }, []);

    return show ? (
        <div className = 'px-6 md:px-16 lg:px-40 pt-30 md:pt-50'>
            <div className = 'flex flex-col md:flex-row gap-8 max-w-6xl mx-auto'>
                <img className = 'max-md:mx-auto rounded-xl h-104 max-w-70 object-cover' src = { `${image_base_url}/${show.movie.poster_path}` } alt = ''/>
                <div className = 'relative flex flex-col gap-3'>
                    <BlurCircle top = '-100px' left = '-100px'/>
                    <p className = 'text-primary'>ENGLISH</p>
                    <h1 className = 'text-4xl font-semibold max-w-96 text-balance'>{show.movie.title}</h1>
                    <div className = 'flex items-center gap-2 text-gray-300'>
                        <StarIcon className = 'w-5 h-5 text-primary fill-primary'/>
                        {show.movie.vote_average.toFixed(1)} User Rating
                    </div>
                    <p className = 'text-gray-400 mt-2 text-sm leading-tight max-w-xl'>{show.movie.overview}</p>
                    <p>{timeFormat(show.movie.runtime)} • {show.movie.genres.map(genre => genre.name).join(', ')} • {dayjs(show.movie.release_date).format('YYYY')}</p>
                    <div className = 'flex items-center flex-wrap gap-4 mt-4'>
                        <button className = 'flex items-center gap-2 px-7 py-3 text-sm bg-gray-800 hover:bg-gray-900 transition rounded-md font-medium cursor-pointer active:scale-95'>
                            <PlayCircleIcon className = 'w-5 h-5'/>
                            Watch trailer
                        </button>
                        <a href = '#dateSelect' className = 'px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer active:scale-95'>Buy ticket</a>
                        <button onClick = { handleFavorite } className = 'bg-gray-700 p-2.5 rounded-full transition cursor-pointer active:scale-95'>
                            <Heart className = { `w-5 h-5 ${favoriteMovies.find(movie => movie._id === id) ? 'fill-primary text-primary' : ''}` }/>
                        </button>
                    </div>
                </div>
            </div>
            <p className = 'text-lg font-medium mt-20'>Cast</p>
            <div className = 'overflow-x-auto no-scrollbar mt-8 pb-4'>
                <div className = 'flex items-center gap-4 w-max px-4'>
                    {show.movie.casts.map((actor, index) => (
                        <div key = { index } className = 'flex flex-col items-center text-center'>
                            <img className = 'rounded-full h-20 md:h-20 aspect-square object-cover' src = { `${image_base_url}/${actor.profile_path}` } alt = ''/>
                            <p className = 'font-medium text-xs mt-3'>{actor.name}</p>
                            <p className = 'text-gray-500 text-xs mt-1'>{actor.character}</p>
                        </div>
                    ))}
                </div>
            </div>
            <DateSelect dateTime = { show.dateTime } id = { id }/>
            <p className = 'text-lg font-medium mt-20 mb-8'>You may also like</p>
            <div className = 'flex flex-wrap max-sm:justify-center gap-8'>
                {shows.slice(0, 4).map((movie, index) => (
                    <MovieCard key = { index } movie = { movie }/>
                ))}
            </div>
            <div className = 'flex justify-center mt-20'>
                <button onClick = { () => {navigate('/movies'); scrollTo(0, 0);} } className = 'px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer'>Show more</button>
            </div>
        </div>
    ) : (
        <Loading/>
    );
}

export default MovieDetails;