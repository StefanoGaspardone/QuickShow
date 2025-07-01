import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

import Title from '../../components/admin/Title';

import { useAppContext } from '../../contexts/AppContext';

const AddTvSeries = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [selectedSeries, setSelectedSeries] = useState(null);
    const [seasons, setSeasons] = useState([]);
    const [tvSeries, setTvSeries] = useState([]);
    const [episodeFiles, setEpisodeFiles] = useState({});
    const [episodeUploadProgress, setEpisodeUploadProgress] = useState({});
    
    const { axios, getToken, tmdb_key, isLoading, setIsLoading } = useAppContext();

    useEffect(() => {
        const timeout = setTimeout(() => {
            if(query.length > 2) fetchTvSeries(query);
            else setResults([]);
        }, 400);

        return () => clearTimeout(timeout);
    }, [query]);

    useEffect(() => {
        getTvSeries();
    }, []);

    useEffect(() => {
        if(selectedSeries) fetchSeasonsAndEpisodes(selectedSeries.id);
        else setSeasons([]);
    }, [selectedSeries]);

    const getTvSeries = async () => {
        try {
            const { data } = await axios.get('/api/series', {
                headers: { Authorization: `Bearer ${await getToken()}` }
            });

            if(data.success) setTvSeries(data.series.map(serie => Number(serie._id)));
            else toast.error(data.message);
        } catch(error) {
            console.log(error);
            toast.error(error.message);
        }
    }

    const fetchTvSeries = async (search) => {
        try {
            const res = await fetch(`https://api.themoviedb.org/3/search/tv?query=${encodeURIComponent(search)}`, {
                headers: { Authorization: `Bearer ${tmdb_key}` }
            });
            const data = await res.json();
            setResults(data.results.filter(serie => !tvSeries.includes(serie.id)).filter(serie => !!serie.first_air_date && !isNaN(new Date(serie.first_air_date).getFullYear())));
        } catch(error) {
            console.log(error);
            toast.error(error.message);
        }
    }

    const fetchSeasonsAndEpisodes = async (seriesId) => {
        const res = await fetch(`https://api.themoviedb.org/3/tv/${seriesId}`, {
            headers: { Authorization: `Bearer ${tmdb_key}` }
        });
        const data = await res.json();
        
        const seasons = await Promise.all(
            data.seasons.filter(season => season.season_number > 0).map(async (season) => {
                const seasonRes = await fetch(`https://api.themoviedb.org/3/tv/${seriesId}/season/${season.season_number}`, {
                    headers: { Authorization: `Bearer ${tmdb_key}` }
                });
                const seasonData = await seasonRes.json();
                return {
                    ...season,
                    episodes: seasonData.episodes
                };
            })
        );
        setSeasons(seasons.filter(season => season.episodes && season.episodes.length > 0));
    };

    const handleEpisodeFileChange = (seasonNumber, episodeNumber, file) => {
        setEpisodeFiles(prev => ({
            ...prev,
            [`${seasonNumber}_${episodeNumber}`]: file
        }));
    };

    const handleSubmit = async () => {
        try {
            setIsLoading(true);

            if(!selectedSeries || !episodeFiles) return toast('Missing required fields');
            
            const uploadedEpisodes = {};
            for(const key of Object.keys(episodeFiles)) {
                const file = episodeFiles[key];
                const formData = new FormData();
                formData.append('video', file);
                
                const res = await axios.post('/api/upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${await getToken()}`,
                    },
                    onUploadProgress: (e) => {
                        const percent = Math.round((e.loaded * 100) / e.total);
                        setEpisodeUploadProgress(prev => ({
                            ...prev,
                            [key]: percent
                        }));
                    }
                });

                if(!res.data.success) {
                    toast.error(`Upload failed for episode ${key}`);
                    setIsLoading(false);
                    return;
                }

                uploadedEpisodes[key] = res.data.url;
                setEpisodeUploadProgress(prev => ({
                    ...prev,
                    [key]: 100
                }));
            }

            const payload = {
                seriesId: selectedSeries.id,
                episodeFiles: uploadedEpisodes,
            }

            const { data } = await axios.post('/api/series', payload, {
                headers: { Authorization: `Bearer ${await getToken()}` }
            });

            if(data.success) { 
                toast.success(data.message);
                
                setQuery('');
                setResults([]);
                setSelectedSeries(null);
                setSeasons([]);
                setEpisodeFiles({});

                await getTvSeries();
            } else toast.error(data.message);
        } catch(error) {
            console.log();
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    }

    const totalEpisodes = seasons.reduce((acc, season) => acc + (season.episodes ? season.episodes.length : 0), 0);

    return (
        <>
            <Title text1 = 'Add' text2 = 'Tv Series'/>
            <div className = 'mx-auto mt-4'>
                <div className = 'flex items-center gap-2 border border-gray-600 px-3 py-2 rounded-md'>
                    <input type = 'text' value = { query } onChange = { e => { setQuery(e.target.value); setSelectedSeries(null); } } placeholder = 'Search a tv series...' className = 'outline-none w-full'/>
                </div>
                {query.length > 0 && !selectedSeries && (
                    results.length > 0 ? (
                        <ul className='border rounded mt-1 bg-gray-800 text-white shadow max-h-64 overflow-y-auto'>
                            {results.map((series, index) => (
                                <li key = { index } onClick={() => { setSelectedSeries(series); setEpisodeFiles({}); }} className='px-3 py-2 hover:bg-gray-600 cursor-pointer'>
                                    {series.original_name} ({new Date(series.first_air_date).getFullYear()})
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <ul className='border rounded mt-1 bg-gray-800 text-white shadow'>
                            <li className='px-3 py-2 hover:bg-gray-600'>No movies found</li>
                        </ul>
                    )
                )}
                {selectedSeries && (
                    <>
                        <h3 className = 'font-bold text-lg mb-2 mt-5'>{selectedSeries.original_name.toUpperCase()}</h3>
                        <p className = 'text-sm text-gray-300 mb-5'>{selectedSeries.overview}</p>
                        {seasons.map(season => (
                            <div key = { season.id } className = 'mb-4'>
                                <h3 className = 'font-bold mb-1'>Season {season.season_number}</h3>
                                <div className = 'flex gap-4 overflow-x-auto pb-2 small-scrollbar'>
                                    {season.episodes.map(episode => (
                                        <div key = { episode.id } className = 'flex flex-col items-center min-w-[180px] rounded'>
                                            {episode.still_path ? (
                                                <img src = { `https://image.tmdb.org/t/p/w300${episode.still_path}` } alt = { episode.name } className = 'object-cover rounded mb-2 bg-gray-900'/>
                                            ) : (
                                                <div className = 'w-32 h-20 flex items-center justify-center rounded mb-2 bg-gray-900 text-gray-500 text-3xl'>
                                                    <span>🎬</span>
                                                </div>
                                            )}
                                            <span className = 'text-xs text-center mb-2 truncate max-w-[140px] font-semibold' title = { episode.name }>{episode.name}</span>
                                            <label className = 'w-full'>
                                                <input type = 'file' name = { `s${season.season_number}_e${episode.episode_number}` } className = 'hidden' disabled = { isLoading } onChange={e => {
                                                    const file = e.target.files[0];
                                                    if(file) handleEpisodeFileChange(season.season_number, episode.episode_number, file);
                                                }}/>
                                                <span className = { `block w-full text-xs text-center bg-primary hover:bg-primary-dull text-white rounded py-1 ${isLoading ? 'opacity-50' : 'cursor-pointer'} transition` }>Choose video file</span>
                                            </label>
                                            {episodeFiles[`${season.season_number}_${episode.episode_number}`] && (
                                                <>
                                                    <span className = "block text-xs text-center text-gray-400 mt-1 truncate max-w-[140px]">
                                                        Video file: {episodeFiles[`${season.season_number}_${episode.episode_number}`].name}
                                                    </span>
                                                    {episodeUploadProgress[`${season.season_number}_${episode.episode_number}`] > 0 && (
                                                        <span className = 'text-xs text-white'>
                                                            Uploading: {episodeUploadProgress[`${season.season_number}_${episode.episode_number}`]}%
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                        <button onClick = { handleSubmit } disabled = { !selectedSeries || Object.keys(episodeFiles).length !== totalEpisodes || isLoading } className = { `bg-primary text-white px-8 py-2 mt-6 rounded transition-all ${!selectedSeries || Object.keys(episodeFiles).length !== totalEpisodes || isLoading ? 'opacity-50' : 'cursor-pointer active:scale-95 hover:bg-primary/90'}` }>
                            Add Tv Series
                        </button>
                    </>
                )}
            </div>
        </>
    );
}

export default AddTvSeries;