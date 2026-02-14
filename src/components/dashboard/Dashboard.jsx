import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Edit, Trash2, Key, Smartphone, CheckCircle, Clock, CreditCard, Shield, RefreshCw, BarChart3, Rocket, Zap, Target, Wrench } from 'lucide-react';
import Layout from '../layout/Layout';
import api from '../../services/api';
import AccessRequestModal from '../apps/AccessRequestModal';
import { useToast } from '../../context/ToastContext';

const Dashboard = () => {
    const [stats, setStats] = useState({ total: 0, active: 0, pending: 0 });
    const [applications, setApplications] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [showAccessModal, setShowAccessModal] = useState(false);
    const [selectedApp, setSelectedApp] = useState(null);
    const navigate = useNavigate();
    const toast = useToast();

    useEffect(() => {
        fetchStats();
        fetchApplications(1);
    }, []);

    const fetchStats = async () => {
        try {
            const response = await api.get('/applications/stats');
            setStats(response.data.stats);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const fetchApplications = async (page) => {
        try {
            setLoading(true);
            const response = await api.get(`/applications?page=${page}&limit=10`);
            setApplications(response.data.applications);
            setPagination(response.data.pagination);
        } catch (error) {
            console.error('Error fetching applications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

        try {
            await api.delete(`/applications/${id}`);
            toast.success(`"${name}" has been deleted successfully.`);
            fetchStats();
            fetchApplications(pagination.page);
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Error deleting application';
            toast.error(errorMsg);
        }
    };

    const handleRequestAccess = (app) => {
        setSelectedApp(app);
        setShowAccessModal(true);
    };

    const handleAccessRequestSuccess = () => {
        fetchApplications(pagination.page);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.pages) {
            fetchApplications(newPage);
        }
    };

    const getAppIcon = (index) => {
        const icons = [CreditCard, Shield, RefreshCw, BarChart3, Rocket, Zap, Target, Wrench];
        const colors = ['blue', 'purple', 'orange', 'green'];
        return {
            Icon: icons[index % icons.length],
            color: colors[index % colors.length]
        };
    };

    return (
        <Layout>
            <div className="page-header">
                <div className="page-header-top">
                    <div>
                        <h1 className="page-title">App Dashboard</h1>
                        <p className="page-description">Manage and monitor your registered applications.</p>
                    </div>
                    <Link to="/apps/new" className="btn btn-primary">
                        <span>+</span>
                        Register New App
                    </Link>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-header">
                        <div className="stat-title">Total Apps</div>
                        <div className="stat-icon primary">
                            <Smartphone size={20} />
                        </div>
                    </div>
                    <div className="stat-value">{stats.total}</div>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <div className="stat-title">Active Apps</div>
                        <div className="stat-icon success">
                            <CheckCircle size={20} />
                        </div>
                    </div>
                    <div className="stat-value">{stats.active}</div>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <div className="stat-title">Pending</div>
                        <div className="stat-icon warning">
                            <Clock size={20} />
                        </div>
                    </div>
                    <div className="stat-value">{stats.pending}</div>
                </div>
            </div>

            {/* Applications Table */}
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>App Name</th>
                            <th>Role</th>
                            <th>Created Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>
                                    Loading applications...
                                </td>
                            </tr>
                        ) : applications.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>
                                    No applications found. Create your first app!
                                </td>
                            </tr>
                        ) : (
                            applications.map((app, index) => {
                                const { icon, color } = getAppIcon(index);
                                return (
                                    <tr key={app._id}>
                                        <td>
                                            <div className="table-app-name">
                                                <div className={`app-icon ${getAppIcon(index).color}`}>
                                                    {(() => {
                                                        const { Icon } = getAppIcon(index);
                                                        return <Icon size={24} />;
                                                    })()}
                                                </div>
                                                <div>
                                                    <span>{app.name}</span>
                                                    {app.isAdmin && (
                                                        <span className="badge success" style={{ marginLeft: '8px', fontSize: '10px' }}>
                                                            Admin
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            {app.userRole ? (
                                                <span className="badge" style={{ backgroundColor: '#DBEAFE', color: '#1E40AF' }}>
                                                    {app.userRole}
                                                </span>
                                            ) : '-'}
                                        </td>
                                        <td>{new Date(app.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                                        <td>
                                            <span className={`badge ${app.status === 'active' ? 'success' : 'warning'}`}>
                                                {app.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="table-actions">
                                                {app.isAdmin ? (
                                                    <>
                                                        <button
                                                            className="btn btn-icon btn-secondary"
                                                            title="Manage Users"
                                                            onClick={() => navigate(`/apps/${app._id}/users`)}
                                                        >
                                                            <Users size={18} />
                                                        </button>
                                                        <button
                                                            className="btn btn-icon btn-secondary"
                                                            title="Edit"
                                                            onClick={() => navigate(`/apps/edit/${app._id}`)}
                                                        >
                                                            <Edit size={18} />
                                                        </button>
                                                        <button
                                                            className="btn btn-icon btn-secondary"
                                                            title="Delete"
                                                            onClick={() => handleDelete(app._id, app.name)}
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        className="btn btn-sm btn-primary"
                                                        title="Request Access"
                                                        onClick={() => handleRequestAccess(app)}
                                                        disabled={!app.roles || app.roles.length === 0}
                                                        style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}
                                                    >
                                                        <Key size={16} />
                                                        Request Access
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>

                {!loading && applications.length > 0 && (
                    <div className="table-pagination">
                        <div className="pagination-info">
                            Showing {((pagination.page - 1) * 10) + 1}-{Math.min(pagination.page * 10, pagination.total)} of {pagination.total} applications
                        </div>
                        <div className="pagination-buttons">
                            <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={pagination.page === 1}
                            >
                                Previous
                            </button>
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={pagination.page === pagination.pages}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Help Card */}
            <div className="help-card">
                <h3 className="help-card-title">Need help with registration?</h3>
                <p className="help-card-description">
                    Explore our integration guides and sample code to get your application up and running in minutes.
                </p>
                <button className="btn" onClick={() => navigate('/documentation')}>View Documentation</button>
            </div>
            {/* Access Request Modal */}
            {showAccessModal && selectedApp && (
                <AccessRequestModal
                    app={selectedApp}
                    onClose={() => setShowAccessModal(false)}
                    onSuccess={handleAccessRequestSuccess}
                />
            )}
        </Layout>
    );
};

export default Dashboard;
