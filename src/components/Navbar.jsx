import { useAuth } from '../context/AuthContext';
import { LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="h-24 glass-nav flex items-center justify-between px-10 sticky top-0 z-10 w-full transition-all duration-300">
            <div>
                <h2 className="text-xl font-bold text-gray-800 tracking-tight">
                    Welcome back, <span className="text-primary">{user?.first_name || user?.username || 'User'}</span>!
                </h2>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-0.5">Let's grow your brand today</p>
            </div>
            
            <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-3 bg-white/50 p-1.5 pr-4 rounded-2xl border border-white/40 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary/20 to-[#8F6BFF]/20 flex items-center justify-center text-primary shadow-inner">
                        <User size={20} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-800 leading-tight">{user?.username}</span>
                        <span className="text-[10px] font-bold text-green-500 uppercase tracking-tight">Online</span>
                    </div>
                </div>
                
                <button
                    onClick={handleLogout}
                    className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-300 group"
                    title="Logout"
                >
                    <LogOut size={22} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
            </div>
        </header>
    );
};

export default Navbar;
