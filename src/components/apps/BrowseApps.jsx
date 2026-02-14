import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Key, CheckCircle, CreditCard, Shield, RefreshCw, BarChart3, Rocket, Zap, Target, Wrench } from 'lucide-react';
import Layout from '../layout/Layout';
import api from '../../services/api';
import AccessRequestModal from '../apps/AccessRequestModal';

const BrowseApps = () => {
    const [applications, setApplications] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [showAccessModal, setShowAccessModal] = useState(false);
    const [selectedApp, setSelectedApp] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchApplications(1);
    }, []);

    const fetchApplications = async (page) => {
        try {
            setLoading(true);
            const response = await api.get(`/applications/browse/all?page=${page}&limit=20`);
            setApplications(response.data.applications);
            setPagination(response.data.pagination);
        } catch (error) {
            console.error('Error fetching applications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRequestAccess = (app) => {
        // Create a modified app object with only available roles
        const appForRequest = {
            ...app,
            roles: app.availableRoles,
        };
        setSelectedApp(appForRequest);
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
            color: colors[index % colors.length],
        };
    };

    return (
        <Layout>
            <div className="page-header">
                <div className="breadcrumb">
                    <span className="breadcrumb-item" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
                        Dashboard
                    </span>
                    <span className="breadcrumb-separator">›</span>
                    <span className="breadcrumb-item active">Browse Apps</span>
                </div>
                <h1 className="page-title">Browse Applications</h1>
                <p className="page-description">
                    Discover applications and request access to the roles you need.
                </p>
            </div>

            {/* Applications Grid */}
            <div className="browse-apps-grid">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px', gridColumn: '1 / -1' }}>
                        Loading applications...
                    </div>
                ) : applications.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', gridColumn: '1 / -1' }}>
                        No applications available.
                    </div>
                ) : (
                    applications.map((app, index) => {
                        const { icon, color } = getAppIcon(index);
                        return (
                            <div key={app._id} className="browse-app-card">
                                <div className="browse-app-header">
                                    <div className={`browse-app-icon ${getAppIcon(index).color}`}>
                                        {(() => {
                                            const { Icon } = getAppIcon(index);
                                            return <Icon size={28} />;
                                        })()}
                                    </div>
                                    <div className="browse-app-info">
                                        <h3 className="browse-app-name">{app.name}</h3>
                                        <p className="browse-app-owner">
                                            by {app.userId.username}
                                            {app.isOwner && <span className="badge success" style={{ marginLeft: '8px', fontSize: '10px' }}>You</span>}
                                        </p>
                                    </div>
                                </div>

                                <div className="browse-app-body">
                                    <div className="browse-app-detail">
                                        <span className="detail-label">Redirect URI:</span>
                                        <span className="detail-value">{app.redirectUri}</span>
                                    </div>

                                    <div className="browse-app-detail">
                                        <span className="detail-label">Status:</span>
                                        <span className={`badge ${app.status === 'active' ? 'success' : 'warning'}`}>
                                            {app.status}
                                        </span>
                                    </div>

                                    {app.userRole && (
                                        <div className="browse-app-detail">
                                            <span className="detail-label">Your Role:</span>
                                            <span className="badge" style={{ backgroundColor: '#DBEAFE', color: '#1E40AF' }}>
                                                {app.userRole}
                                            </span>
                                        </div>
                                    )}

                                    <div className="browse-app-detail">
                                        <span className="detail-label">Available Roles:</span>
                                        <div className="browse-app-roles">
                                            {app.roles && app.roles.length > 0 ? (
                                                app.roles.map((role, idx) => (
                                                    <span key={idx} className="tag" style={{ fontSize: '11px' }}>
                                                        {role}
                                                    </span>
                                                ))
                                            ) : (
                                                <span style={{ color: 'var(--color-gray-400)', fontSize: '13px' }}>No roles defined</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="browse-app-footer">
                                    {app.isAdmin ? (
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => navigate(`/apps/edit/${app._id}`)}
                                            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-2)' }}
                                        >
                                            <Settings size={16} />
                                            Manage App
                                        </button>
                                    ) : app.availableRoles && app.availableRoles.length > 0 ? (
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => handleRequestAccess(app)}
                                            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-2)' }}
                                        >
                                            <Key size={16} />
                                            Request Access
                                        </button>
                                    ) : app.hasAccess ? (
                                        <button className="btn btn-secondary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-2)' }} disabled>
                                            <CheckCircle size={16} />
                                            Already Have Access
                                        </button>
                                    ) : (
                                        <button className="btn btn-secondary" style={{ width: '100%' }} disabled>
                                            No Roles Available
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Pagination */}
            {!loading && applications.length > 0 && (
                <div className="table-container" style={{ marginTop: '24px' }}>
                    <div className="table-pagination">
                        <div className="pagination-info">
                            Showing {((pagination.page - 1) * 20) + 1}-{Math.min(pagination.page * 20, pagination.total)} of {pagination.total} applications
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
                </div>
            )}

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

export default BrowseApps;
