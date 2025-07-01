import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import toast from 'react-hot-toast';
import { Heart, PlayCircleIcon, RotateCcwIcon, StarIcon } from 'lucide-react';
import dayjs from 'dayjs';

import Loading from '../components/Loading';
import BlurCircle from '../components/BlurCircle';
import TrailersSection from '../components/TrailersSection';

import { useAppContext } from '../contexts/AppContext';

const SerieDetails = () => {
    const { id } = useParams();
    const [serie, setSerie] = useState(null);
    const [selectedSeason, setSelectedSeason] = useState(0);
    
    const { axios, user, getToken, image_base_url } = useAppContext();

    useEffect(() => {
        const getSerie = async () => {
            try {
                const { data } = await axios.get(`/api/series/${id}`);

                if(data.success) setSerie(data.series);
                else toast.error(data.message);
            } catch(error) {
                console.log(error);
            }
        }

        getSerie();
    }, []);

    return serie ? (
        <div className = 'px-6 md:px-16 lg:px-40 pt-30 md:pt-50'>
            <div className = 'flex flex-col md:flex-row gap-8 max-w-6xl mx-auto'>
                <div className = 'relative rounded-lg overflow-hidden'>
                    <img className = 'max-md:mx-auto h-104 max-w-70 object-cover' src = { `${image_base_url}/${serie.poster_path}` } alt = ''/>
                </div>
                <div className = 'relative flex flex-col gap-3'>
                    <BlurCircle top = '-100px' left = '-100px'/>
                    <p className = 'text-primary'>ENGLISH</p>
                    <h1 className = 'text-4xl font-semibold text-balance'>{serie.title}</h1>
                    <div className = 'flex items-center gap-2 text-gray-300'>
                        <StarIcon className = 'w-5 h-5 text-primary fill-primary'/>
                        {serie.vote_average.toFixed(1)} User Rating
                    </div>
                    <p className = 'text-gray-400 mt-2 text-sm leading-tight max-w-xl'>{serie.overview}</p>
                    <p>{serie.seasons.length} {serie.seasons.length > 1 ? 'seasons' : 'season'} • {serie.genres.map(genre => genre.name).join(', ')} • {dayjs(serie.release_date).format('YYYY')}</p>
                    <div className = 'flex items-center flex-wrap gap-4'>
                        <a href = '#seasons' className = 'flex items-center gap-2 px-7 py-3 text-sm bg-gray-800 hover:bg-gray-900 transition rounded-md font-medium cursor-pointer active:scale-95'>
                            <PlayCircleIcon className = 'w-5 h-5'/>
                            Play
                        </a>
                        <button onClick={() => {}} className = 'p-3 text-sm bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer active:scale-95'>
                            <RotateCcwIcon className = 'w-5 h-5'/> 
                        </button>
                    </div>
                    <div className = 'flex items-center flex-wrap gap-4'>
                        <a href = '#trailers' className = 'flex items-center gap-2 px-7 py-3 text-sm bg-gray-800 hover:bg-gray-900 transition rounded-md font-medium cursor-pointer active:scale-95'>
                            <PlayCircleIcon className = 'w-5 h-5'/>
                            Watch trailer
                        </a>
                        {/* <button onClick = { handleFavorite } className = 'bg-gray-700 p-2.5 rounded-full transition cursor-pointer active:scale-95'>
                            <Heart className = { `w-5 h-5 ${favoriteMovies.find(movie => movie._id === id) ? 'fill-primary text-primary' : ''}` }/>
                        </button> */}
                    </div>
                </div>
            </div>
            {/* seasons and episodes */}
            <p className = 'text-lg font-medium mt-20 mb-2' id = 'seasons'>Seasons</p>
            <select className = 'bg-gray-800 text-white px-3 py-2 rounded mb-3' value = { selectedSeason } onChange = { e => setSelectedSeason(Number(e.target.value)) }>
                {serie.seasons.map((season, idx) => (
                    <option key = { season.id } value = { idx }>
                        Season {season.season_number}
                    </option>
                ))}
            </select>
            {serie.seasons[selectedSeason]?.overview && (
                <p className = 'text-sm text-white mb-4'>{serie.seasons[selectedSeason].overview}</p>
            )}
            <div className = 'overflow-x-auto small-scrollbar pb-2'>
                <div className = 'flex gap-6 w-max group'>
                    {serie.seasons[selectedSeason]?.episodes?.map(episode => (
                        <div key = { episode.id } className = 'relative group-hover:not-hover:opacity-50 flex flex-col items-center max-w-[220px] rounded duration-300 transition'>
                            <div className = 'relative group duration-300 transition max-md:h-60 md:max-h-60 cursor-pointer group/item'>
                                {episode.still_path ? (
                                    <img src = { `https://image.tmdb.org/t/p/w300${episode.still_path}` } alt = { episode.name } className = 'object-cover rounded mb-2 bg-gray-900 group-hover:opacity-50'/>
                                ) : (
                                    <div className = 'w-32 h-20 flex items-center justify-center rounded mb-2 bg-gray-900 text-gray-500 text-3xl group-hover:opacity-50'>
                                        <span>🎬</span>
                                    </div>
                                )}
                                <PlayCircleIcon className = 'absolute top-1/2 left-1/2 h-20 w-20 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover/item:opacity-100' strokeWidth = { 0.6 }/>
                            </div>
                            <span className = 'text-xs text-center truncate font-semibold' title = { episode.name }>{episode.name}</span>
                            <span className = 'block text-xs text-gray-400 text-center overflow-y-auto' style = {{ maxHeight: '60px' }}>{episode.overview || 'No description'}</span>
                        </div>
                    ))}
                </div>
            </div>
            <p className = 'text-lg font-medium mt-20'>Cast</p>
            <div className = 'overflow-x-auto small-scrollbar mt-8 pb-4'>
                <div className = 'flex items-center gap-4 w-max px-4'>
                    {serie.casts.map((actor, index) => (
                        <div key = { index } className = 'flex flex-col items-center text-center'>
                            <img className = 'rounded-full h-20 md:h-20 aspect-square object-cover' src = { `${image_base_url}/${actor.profile_path}` } alt = ''/>
                            <p className = 'font-medium text-xs mt-3'>{actor.name}</p>
                            <p className = 'text-gray-500 text-xs mt-1'>{actor.character}</p>
                        </div>
                    ))}
                </div>
            </div>
            <TrailersSection trailers = { serie.trailers }/>
        </div>
    ) : (
        <Loading/>
    );
}

export default SerieDetails;