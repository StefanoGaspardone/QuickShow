import mongoose from 'mongoose';

const episodeSchema = new mongoose.Schema({
    episode_number: { type: Number, required: true },
    name: { type: String, required: true },
    overview: { type: String },
    air_date: { type: String },
    still_path: { type: String },
    video: { type: String },
}, { _id: false });

const seasonSchema = new mongoose.Schema({
    season_number: { type: Number, required: true },
    name: { type: String, required: true },
    overview: { type: String },
    air_date: { type: String },
    episodes: [episodeSchema],
}, { _id: false });

const tvSeriesSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    title: { type: String, required: true },
    overview: { type: String, required: true },
    poster_path: { type: String, required: true },
    backdrop_path: { type: String, required: true },
    release_date: { type: String, required: true },
    original_language: { type: String },
    tagline: { type: String },
    genres: { type: Array, required: true },
    casts: { type: Array, required: true },
    vote_average: { type: Number, required: true },
    vote_count: { type: Number, required: true },
    trailers: { type: Array, default: [] },
    video: { type: String },
    seasons: [seasonSchema],
}, { timestamps: true });

const TvSeries = mongoose.model('TvSeries', tvSeriesSchema);

export default TvSeries;