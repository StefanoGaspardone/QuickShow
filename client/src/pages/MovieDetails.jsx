import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router';
import { Heart, PlayCircleIcon, RotateCcwIcon, StarIcon } from 'lucide-react';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import ReactPlayer from 'react-player';

import BlurCircle from '../components/BlurCircle';
import DateSelect from '../components/DateSelect';
import Loading from '../components/Loading';
import TrailersSection from '../components/TrailersSection';

import { useAppContext } from '../contexts/AppContext';

import timeFormat from '../libs/timeFormat.mjs';

const MovieDetails = () => {
    const { id } = useParams();
    const [movie, setMovie] = useState(null);
    const [shows, setShows] = useState([]);
    const [showPlayer, setShowPlayer] = useState(false);
    const [startTime, setStartTime] = useState(0);
    const [playing, setPlaying] = useState(false);

    const playerRef = useRef(null);
    const { axios, user, getToken, fetchFavoritesMovies, favoriteMovies, image_base_url } = useAppContext();

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

    const openPlayer = async (mode) => {
        if(!user) return toast('Please login to proceed');

        if(mode === 'resume') {
            try {
                const { data } = await axios.get(`/api/movies/${id}/progress`, {
                    headers: { Authorization: `Bearer ${await getToken()}` }
                });
                setStartTime(data.progress || 0);
            } catch(error) {
                console.log(error);
                setStartTime(0);
            }
        } else setStartTime(0);

        setShowPlayer(true);
        setPlaying(true);
    }

    const handleExitPlayer = async () => {
        setShowPlayer(false);
        setPlaying(false);

        try {
            await axios.post(`/api/movies/${id}/progress`, {
                progress: Math.floor(startTime)
            }, {
                headers: { Authorization: `Bearer ${await getToken()}` }
            });
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        const getMovie = async () => {
            try {
                const { data } = await axios.get(`/api/movies/${id}`);

                if(data.success) setMovie(data.movie);
                else toast.error(data.message);
            } catch(error) {
                console.log(error);
            }
        }

        const getShows = async () => {
            try {
                const { data } = await axios.get(`/api/movies/${id}/shows`);

                if(data.success) setShows(data);
                else toast.error(data.message);
                console.log('shows: ' + data.dateTime);
            } catch(error) {
                console.log(error);
            }
        }

        getMovie();
        getShows();
    }, []);

    return movie ? (
        <div className = 'px-6 md:px-16 lg:px-40 pt-30 md:pt-50'>
            <div className = 'flex flex-col md:flex-row gap-8 max-w-6xl mx-auto'>
                <img className = 'max-md:mx-auto rounded-xl h-104 max-w-70 object-cover' src = { `${image_base_url}/${movie.poster_path}` } alt = ''/>
                <div className = 'relative flex flex-col gap-3'>
                    <BlurCircle top = '-100px' left = '-100px'/>
                    <p className = 'text-primary'>ENGLISH</p>
                    <h1 className = 'text-4xl font-semibold max-w-96 text-balance'>{movie.title}</h1>
                    <div className = 'flex items-center gap-2 text-gray-300'>
                        <StarIcon className = 'w-5 h-5 text-primary fill-primary'/>
                        {movie.vote_average.toFixed(1)} User Rating
                    </div>
                    <p className = 'text-gray-400 mt-2 text-sm leading-tight max-w-xl'>{movie.overview}</p>
                    <p>{timeFormat(movie.runtime)} • {movie.genres.map(genre => genre.name).join(', ')} • {dayjs(movie.release_date).format('YYYY')}</p>
                    <div className = 'flex items-center flex-wrap gap-4'>
                        <button onClick={() => openPlayer('resume')} className = 'flex items-center gap-2 px-7 py-3 text-sm bg-gray-800 hover:bg-gray-900 transition rounded-md font-medium cursor-pointer active:scale-95'>
                            <PlayCircleIcon className = 'w-5 h-5'/>
                            Play
                        </button>
                        <button onClick={() => openPlayer('restart')} className = 'p-3 text-sm bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer active:scale-95'>
                            <RotateCcwIcon className = 'w-5 h-5'/> 
                        </button>
                    </div>
                    <div className = 'flex items-center flex-wrap gap-4'>
                        <a href = '#trailers' className = 'flex items-center gap-2 px-7 py-3 text-sm bg-gray-800 hover:bg-gray-900 transition rounded-md font-medium cursor-pointer active:scale-95'>
                            <PlayCircleIcon className = 'w-5 h-5'/>
                            Watch trailer
                        </a>
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
                    {movie.casts.map((actor, index) => (
                        <div key = { index } className = 'flex flex-col items-center text-center'>
                            <img className = 'rounded-full h-20 md:h-20 aspect-square object-cover' src = { `${image_base_url}/${actor.profile_path}` } alt = ''/>
                            <p className = 'font-medium text-xs mt-3'>{actor.name}</p>
                            <p className = 'text-gray-500 text-xs mt-1'>{actor.character}</p>
                        </div>
                    ))}
                </div>
            </div>
            <DateSelect dateTime = { shows.dateTime } id = { id }/>
            <TrailersSection trailers = { movie.trailers }/>
            {showPlayer && (
                <div className = 'fixed top-0 left-0 w-full h-full bg-black z-50'>
                    <button onClick = { handleExitPlayer } className = 'absolute top-4 left-4 z-50 bg-white text-black px-3 py-1 rounded cursor-pointer'>✖</button>
                    <ReactPlayer ref = { playerRef } url = { movie.trailers[0].url } playing = { playing } controls = { false } width = '100%' height = '100%' onReady = { () => {
                        if (startTime > 0 && playerRef.current) {
                            playerRef.current.seekTo(startTime, 'seconds');
                        }
                    } } onProgress = { ({ playedSeconds }) => setStartTime(playedSeconds) }/>
                </div>
            )}
        </div>
    ) : (
        <Loading/>
    );
}

export default MovieDetails;