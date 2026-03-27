import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, PenTool, BarChart3, CalendarDays, Share2, Settings as SettingsIcon } from 'lucide-react';

const Sidebar = () => {
    const location = useLocation();
    const links = [
        { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={22} /> },
        { name: 'AI Content', path: '/content', icon: <PenTool size={22} /> },
        { name: 'Scheduler', path: '/scheduler', icon: <CalendarDays size={22} /> },
        { name: 'Analytics', path: '/analytics', icon: <BarChart3 size={22} /> },
        { name: 'Accounts', path: '/accounts', icon: <Share2 size={22} /> },
        { name: 'Settings', path: '/settings', icon: <SettingsIcon size={22} /> },
    ];

    return (
        <aside className="w-72 bg-white/80 backdrop-blur-xl border-r border-gray-100 flex-shrink-0 flex flex-col h-screen fixed z-20">
            <div className="h-24 flex items-center px-8">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-tr from-primary to-[#8F6BFF] rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                        <Share2 className="text-white" size={24} />
                    </div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent tracking-tight">
                        Nanban
                    </h1>
                </div>
            </div>
            
            <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
                {links.map((link) => {
                    const active = location.pathname.startsWith(link.path);
                    return (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`side-nav-link group ${
                                active
                                    ? 'bg-primary/10 text-primary shadow-sm shadow-primary/5'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-primary'
                            }`}
                        >
                            <span className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
                                {link.icon}
                            </span>
                            <span className="font-semibold tracking-wide">{link.name}</span>
                        </Link>
                    );
                })}
            </nav>
            
            <div className="p-6 border-t border-gray-50">
                <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-4 border border-primary/10">
                    <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Status</p>
                    <p className="text-sm font-semibold text-gray-700">Pro Developer Plan</p>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
