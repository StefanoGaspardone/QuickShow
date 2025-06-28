import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

import Title from '../../components/admin/Title';

import { useAppContext } from '../../contexts/AppContext';

const AddMovie = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [videoFile, setVideoFile] = useState(null);
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
    }

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
    }

    const handleSubmit = async () => {
        try {
            setIsLoading(true);

            if(!selectedMovie || !videoFile) return toast('Missing required fields');
            
            const videoUrl = await uploadCloudinary(videoFile);
            const payload = {
                movieId: selectedMovie.id,
                video: videoUrl,
            }

            const { data } = await axios.post('/api/movies', payload, {
                headers: { Authorization: `Bearer ${await getToken()}` }
            });

            if(data.success) { 
                toast.success(data.message);
                
                setQuery('');
                setResults([]);
                setSelectedMovie(null);
                setVideoFile(null);

                await getMovies();
            } else toast.error(data.message);
        } catch(error) {
            console.log();
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    }

    const uploadCloudinary = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'unsigned_preset');

        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/video/upload`, { 
            method: 'POST', 
            body: formData 
        });
        const data = await res.json();

        if(data.secure_url) return data.secure_url;
        throw new Error(data.error?.message || 'Cloudinary upload failed');
    }

    return (
        <>
            <Title text1 = 'Add' text2 = 'Movie'/>
            <div className = 'mx-auto mt-4'>
                <div className = 'flex items-center gap-2 border border-gray-600 px-3 py-2 rounded-md'>
                    <input type = 'text' value = { query } onChange = { e => { setQuery(e.target.value); setSelectedMovie(null); } } placeholder = 'Search a movie...' className = 'outline-none w-full'/>
                </div>
                
                {query.length > 0 && !selectedMovie && (
                    results.length > 0 ? (
                        <ul className='border rounded mt-1 bg-gray-800 text-white shadow max-h-64 overflow-y-auto'>
                            {results.map((movie, index) => (
                                <li key={index} onClick={() => setSelectedMovie(movie)} className='px-3 py-2 hover:bg-gray-600 cursor-pointer'>
                                    {movie.title} ({new Date(movie.release_date).getFullYear()})
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <ul className='border rounded mt-1 bg-gray-800 text-white shadow'>
                            <li className='px-3 py-2 hover:bg-gray-600'>No movies found</li>
                        </ul>
                    )
                )}
                {selectedMovie && (
                    <>
                        <h3 className = 'font-bold text-lg mb-2 mt-5'>{selectedMovie.title.toUpperCase()}</h3>
                        <p className = 'text-sm text-gray-300'>{selectedMovie.overview}</p>
                        <div className = 'mt-4'>
                            <label htmlFor = 'video-upload' className = 'flex gap-2 items-center'>
                                <span className = 'bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition-all cursor-pointer inline-block'>Choose video file</span>
                                {videoFile && <span>Video: {videoFile.name}</span>}
                            </label>
                            <input id = 'video-upload' type = 'file' accept = '' onChange = { e => setVideoFile(e.target.files[0]) } className = 'hidden'/>
                        </div>
                        <button onClick = { handleSubmit } disabled = { !selectedMovie || !videoFile || isLoading } className = { `bg-primary text-white px-8 py-2 mt-6 rounded transition-all ${!selectedMovie || !videoFile || isLoading ? 'opacity-50' : 'cursor-pointer active:scale-95 hover:bg-primary/90'}` }>
                            Add Movie
                        </button>
                    </>
                )}
            </div>
        </>
    );
}

export default AddMovie;