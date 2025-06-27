import mongoose from "mongoose";

const progressSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    movieId: { type: String, required: true },
    progress: { type: Number, default: 0 },
}, { timestamps: true });

const Progress = mongoose.model("Progress", progressSchema);

export default Progress;