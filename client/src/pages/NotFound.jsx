import { Link } from "react-router";
import { HomeIcon } from "lucide-react";

import BlurCircle from "../components/BlurCircle";

const NotFound = () => {
    return (
        <div className = 'flex flex-col items-center justify-center h-screen'>
            <BlurCircle top = '150px' left = '0px'/>
            <BlurCircle bottom = '50px' right = '50px'/>
            <h1 className = 'text-9xl font-bold text-center text-primary'>404</h1>
            <p className = 'text-3xl font-bold text-center mt-3'>Page Not Found</p>
            <Link to = '/' className = 'mt-4 rounded-full px-6 py-2 text-xl font-semibold flex justify-center items-center gap-3 text-white bg-primary hover:bg-primary-dull transition active:scale-95'><HomeIcon/> Return to home</Link>
        </div>
    );
}

export default NotFound;