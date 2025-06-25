import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Heart, PlayCircleIcon, StarIcon } from 'lucide-react';
import dayjs from 'dayjs';

import BlurCircle from '../components/BlurCircle';
import DateSelect from '../components/DateSelect';
import MovieCard from '../components/MovieCard';
import Loading from '../components/Loading';

import { dummyDateTimeData, dummyShowsData } from '../assets/assets';
import timeFormat from '../libs/timeFormat.mjs';

const MovieDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [show, setShow] = useState();

    useEffect(() => {
        const getShow = async () => {
            const show = dummyShowsData.find(show => show._id === id);
            if(show) setShow({
                        show,
                        dateTime: dummyDateTimeData,
                    });
        }

        getShow();
    }, [id]);

    return show ? (
        <div className = 'px-6 md:px-16 lg:px-40 pt-30 md:pt-50'>
            <div className = 'flex flex-col md:flex-row gap-8 max-w-6xl mx-auto'>
                <img className = 'max-md:mx-auto rounded-xl h-104 max-w-70 object-cover' src = {show.show.poster_path} alt = ''/>
                <div className = 'relative flex flex-col gap-3'>
                    <BlurCircle top = '-100px' left = '-100px'/>
                    <p className = 'text-primary'>ENGLISH</p>
                    <h1 className = 'text-4xl font-semibold max-w-96 text-balance'>{show.show.title}</h1>
                    <div className = 'flex items-center gap-2 text-gray-300'>
                        <StarIcon className = 'w-5 h-5 text-primary fill-primary'/>
                        {show.show.vote_average.toFixed(1)} User Rating
                    </div>
                    <p className = 'text-gray-400 mt-2 text-sm leading-tight max-w-xl'>{show.show.overview}</p>
                    <p>{timeFormat(show.show.runtime)} • {show.show.genres.map(genre => genre.name).join(', ')} • {dayjs(show.show.release_date).format('YYYY')}</p>
                    <div className = 'flex items-center flex-wrap gap-4 mt-4'>
                        <button className = 'flex items-center gap-2 px-7 py-3 text-sm bg-gray-800 hover:bg-gray-900 transition rounded-md font-medium cursor-pointer active:scale-95'>
                            <PlayCircleIcon className = 'w-5 h-5'/>
                            Watch trailer
                        </button>
                        <a href = '#dateSelect' className = 'px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer active:scale-95'>Buy ticket</a>
                        <button className = 'bg-gray-700 p-2.5 rounded-full transition cursor-pointer active:scale-95'>
                            <Heart className = { `w-5 h-5` }/>
                        </button>
                    </div>
                </div>
            </div>
            <p>Cast</p>
            <div className = 'overflow-x-auto no-scrollbar mt-8 pb-4'>
                <div className = 'flex items-center gap-4 w-max px-4'>
                    {show.show.casts.slice(0, 12).map((actor, index) => (
                        <div key = { index } className = 'flex flex-col items-center text-center'>
                            <img className = 'rounded-full h-20 md:h-20 aspect-square object-cover' src = { actor.profile_path } alt = ''/>
                            <p className = 'font-medium text-xs mt-3'>{actor.name}</p>
                        </div>
                    ))}
                </div>
            </div>
            <DateSelect dateTime = { show.dateTime } id = { id }/>
            <p className = 'text-lg font-medium mt-20 mb-8'>You may also like</p>
            <div className = 'flex flex-wrap max-sm:justify-center gap-8'>
                {dummyShowsData.slice(0, 4).map((movie, index) => (
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