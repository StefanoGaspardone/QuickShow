import { NavLink } from 'react-router';
import { LayoutDashboardIcon, ListCollapseIcon, ListIcon, PlusSquareIcon, ClapperboardIcon, LogOutIcon  } from 'lucide-react';

import { assets } from '../../assets/assets';

const user = {
    firstName: 'Admin',
    lastName: 'user',
    imageUrl: assets.profile,
};

const adminNavLinks = [
    {
        name: 'Dashboard',
        path: '/admin',
        icon: LayoutDashboardIcon,
    },
    {
        name: 'Add Movie',
        path: '/admin/movies/new',
        icon: ClapperboardIcon,
    },
    {
        name: 'List Movies',
        path: '/admin/movies',
        icon: ListIcon, 
    },
    {
        name: 'Add Shows',
        path: '/admin/shows/new',
        icon: PlusSquareIcon,
    },
    {
        name: 'List Shows',
        path: '/admin/shows',
        icon: ListIcon,
    },
    {
        name: 'List Bookings',
        path: '/admin/bookings',
        icon: ListCollapseIcon,
    },
];

const AdminSidebar = () => {
    return (
        <div className = 'h-[calc(100vh-64px)] flex flex-col justify-between md:max-w-60 w-full border-r border-gray-300/20 text-sm'>
            <div>
                <img className = 'h-9 md:h-14 w-9 md:w-14 rounded-full mx-auto mt-8' src = { user.imageUrl } alt = ''/>
                <p className = 'mt-2 text-base max-md:hidden text-center'>{user.firstName} {user.lastName}</p>
                <div className = 'w-full'>
                    {adminNavLinks.map((link, index) => (
                        <NavLink key = { index } to = { link.path } end className = {({ isActive }) => `relative flex items-center max-md:justify-center gap-2 w-full py-2.5 min-md:pl-10 first:mt-6 text-gray-400 ${isActive && 'bg-primary/15 text-primary group'}` }>
                            {({ isActive }) => (
                                <>
                                    <link.icon className = 'w-5 h-5' />
                                    <p className = 'max-md:hidden'>{link.name}</p>
                                    <span className = { `w-1.5 h-10 rounded-l right-0 absolute ${isActive && 'bg-primary'}` }></span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>
            </div>
            <div className = 'w-full mb-1'>
                <NavLink to = '/' end className = 'relative flex items-center max-md:justify-center gap-2 w-full py-2.5 min-md:pl-10 text-gray-400 hover:text-primary transition'>
                    <LogOutIcon className = 'w-5 h-5'/>
                    <p className = 'max-md:hidden'>Homepage</p>
                </NavLink>
            </div>
        </div>
    );
}

export default AdminSidebar;