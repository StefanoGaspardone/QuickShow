import { StarIcon } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

import Title from "../../components/admin/Title";

import { useAppContext } from "../../contexts/AppContext";

import kConverter from "../../libs/kConverter.mjs";

const ListMovies = () => {
    const [movies, setMovies] = useState([]);
    const { axios, getToken, image_base_url } = useAppContext();

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

    return (
        <>
            <Title text1 = 'List' text2 = 'Movies'/>
            {movies.length === 0 ? (
                <div className = 'mt-10 text-gray-400'>No movies available.</div>
            ) : (
                <div className = 'mt-10 group flex flex-wrap gap-4 w-max'>
                    {movies.map((movie, index) => (
                        <div key = { index } className = { `relative max-w-40 cursor-pointer group-hover:not-hover:opacity-40 hover:-translate-y-1 transition duration-300 ` }>
                            <div className = 'relative rounded-lg overflow-hidden'>
                                <img className = 'w-full object-cover brightness-90' src = { `${image_base_url}/${movie.poster_path}` } alt = ''/>
                                <div className = 'text-sm flex items-center justify-between p-2 bg-black/70 w-full absolute bottom-0 left-0'>
                                    <p className = 'flex items-center gap-1 text-gray-400'>
                                        <StarIcon className = 'w-4 h-4 text-primary fill-primary'/>
                                        {movie.vote_average.toFixed(1)}
                                    </p>
                                    <p className = 'text-gray-300'>{kConverter(movie.vote_count)} Votes</p>
                                </div>
                            </div>
                            <p className = 'font-medium truncate'>{movie.title}</p>
                            <p className = 'text-gray-400 text-sm'>{movie.release_date}</p>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}

export default ListMovies;