import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

import Title from '../../components/admin/Title';

import { useAppContext } from '../../contexts/AppContext';

const AddMovie = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [videoFile, setVideoFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [movies, setMovies] = useState([]);
    const { axios, getToken, tmdb_key, setIsLoading, isLoading } = useAppContext();

    useEffect(() => {
        const timeout = setTimeout(() => {
            if(query.length > 2) fetchMovies(query);
            else setResults([]);
        }, 400);

        return () => clearTimeout(timeout);
    }, [query]);

    useEffect(() => {
        getMovies();
    }, []);

    const getMovies = async () => {
        try {
            const { data } = await axios.get('/api/movies', {
                headers: { Authorization: `Bearer ${await getToken()}` }
            });

            if(data.success) setMovies(data.movies.map(movie => Number(movie._id)));
            else toast.error(data.message);
        } catch(error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    const fetchMovies = async (search) => {
        try {
            const res = await fetch(`https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(search)}`, {
                headers: { Authorization: `Bearer ${tmdb_key}` }
            });

            const data = await res.json();
            setResults(data.results.filter(movie => !movies.includes(movie.id)).filter(movie => !!movie.release_date && !isNaN(new Date(movie.release_date).getFullYear())));
        } catch(error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    const handleSubmit = async () => {
        if(!selectedMovie) return toast.error('No movie selected');
        if(!videoFile) return toast.error('No video file selected');

        try {
            setIsLoading(true);

            const formData = new FormData();
            formData.append('video', videoFile);

            const res = await axios.post('/api/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${await getToken()}`,
                },
                onUploadProgress: (e) => {
                    const percent = Math.round((e.loaded * 100) / e.total);
                    setUploadProgress(percent);
                },
                timeout: 60 * 60 * 1000,
            });

            if(!res.data.success) return toast.error(res.data.message);

            const videoUrl = res.data.url;
            const payload = {
                movieId: selectedMovie.id,
                video: videoUrl,
            };

            const { data } = await axios.post('/api/movies', payload, {
                headers: { Authorization: `Bearer ${await getToken()}` }
            });

            if(data.success) {
                toast.success(data.message);
                setQuery('');
                setResults([]);
                setSelectedMovie(null);
                setVideoFile(null);
                setUploadProgress(0);

                await getMovies();
            } else toast.error(data.message);
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Title text1 = 'Add' text2 = 'Movie'/>
            <div className = 'mx-auto mt-4'>
                <div className = { `flex items-center gap-2 border border-gray-600 px-3 py-2 rounded-md ${isLoading && 'opacity-50'}` }>
                    <input type = 'text' value = { query } onChange = { e => { setQuery(e.target.value); setSelectedMovie(null); } } placeholder = 'Search a movie...' className = 'outline-none w-full' disabled = { isLoading }/>
                </div>
                {query.length > 0 && !selectedMovie && (
                    results.length > 0 ? (
                        <ul className = 'border rounded mt-1 bg-gray-800 text-white shadow max-h-64 overflow-y-auto'>
                            {results.map((movie, index) => (
                                <li key = {index } onClick = { () => setSelectedMovie(movie) } className = 'px-3 py-2 hover:bg-gray-600 cursor-pointer'>
                                    {movie.title} ({new Date(movie.release_date).getFullYear()})
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <ul className = 'border rounded mt-1 bg-gray-800 text-white shadow'>
                            <li className = 'px-3 py-2 hover:bg-gray-600'>No movies found</li>
                        </ul>
                    )
                )}
                {selectedMovie && (
                    <>
                        <h3 className = 'font-bold text-lg mb-2 mt-5'>{selectedMovie.title.toUpperCase()}</h3>
                        <p className = 'text-sm text-gray-300'>{selectedMovie.overview}</p>
                        <div className = 'mt-4 flex gap-2 items-center'>
                            <input id = 'upload-input' type = 'file' accept = 'video/*' className = 'hidden' onChange = { e => setVideoFile(e.target.files[0]) } disabled = { isLoading }/>
                            <button type = 'button' onClick={() => document.getElementById('upload-input').click()} className = { `bg-primary text-white px-8 py-2 rounded transition-all ${isLoading ? 'opacity-50' : 'cursor-pointer active:scale-95 hover:bg-primary/90'}` } disabled = {isLoading }>Choose video file</button>
                            {videoFile && <span className = 'text-gray-200'>Video file: {videoFile.name}</span>}
                            {uploadProgress > 0 && (
                                <p className = 'text-white ml-3'>Uploading: {uploadProgress}%</p>
                            )}
                        </div>
                        <button onClick = { handleSubmit } disabled = { !selectedMovie || isLoading } className = { `bg-primary text-white px-8 py-2 mt-6 rounded transition-all ${!selectedMovie || isLoading ? 'opacity-50' : 'cursor-pointer active:scale-95 hover:bg-primary/90'}` }>
                            {isLoading ? 'Uploading...' : 'Add Movie'}
                        </button>
                    </>
                )}
            </div>
        </>
    );
};

export default AddMovie;