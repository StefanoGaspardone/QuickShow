import { Link } from "react-router";
import { LayoutDashboardIcon, ListCollapseIcon, ListIcon, PlusSquareIcon } from 'lucide-react';

import { assets } from '../../assets/assets';

const AdminNavbar = () => {

    return (
        <div className = 'flex items-center justify-between px-6 md:px-10 h-16 border-b border-gray-300/30'>
            <Link to = '/'>
                <img className = 'w-36 h-auto' src = { assets.logo } alt = ''/>
            </Link>
        </div>
    );
}

export default AdminNavbar;