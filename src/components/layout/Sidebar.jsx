import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Search, CheckSquare, FileText, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="logo">
                    <div className="logo-icon">D</div>
                    <div className="logo-text">
                        <div className="logo-title">DevPortal</div>
                        <div className="logo-subtitle">Developer Console</div>
                    </div>
                </div>
            </div>

            <nav className="sidebar-nav">
                <Link
                    to="/dashboard"
                    className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
                >
                    <LayoutDashboard size={20} className="nav-item-icon" />
                    <span>Dashboard</span>
                </Link>
                <Link
                    to="/browse-apps"
                    className={`nav-item ${location.pathname === '/browse-apps' ? 'active' : ''}`}
                >
                    <Search size={20} className="nav-item-icon" />
                    <span>Browse Apps</span>
                </Link>
                <Link
                    to="/manage-requests"
                    className={`nav-item ${location.pathname === '/manage-requests' ? 'active' : ''}`}
                >
                    <CheckSquare size={20} className="nav-item-icon" />
                    <span>Manage Requests</span>
                </Link>
                <Link
                    to="/documentation"
                    className={`nav-item ${location.pathname === '/documentation' ? 'active' : ''}`}
                >
                    <FileText size={20} className="nav-item-icon" />
                    <span>Documentation</span>
                </Link>
            </nav>

            <div className="sidebar-footer">
                <div className="user-profile">
                    <div className="user-avatar">
                        {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="user-info">
                        <div className="user-name">{user?.username}</div>
                        <div className="user-email">{user?.email}</div>
                    </div>
                </div>
                <button onClick={handleLogout} className="btn btn-secondary" style={{ width: '100%', marginTop: 'var(--spacing-4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-2)' }}>
                    <LogOut size={18} />
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
