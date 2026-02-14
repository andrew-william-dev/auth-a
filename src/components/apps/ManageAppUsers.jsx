import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';
import Layout from '../layout/Layout';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const ManageAppUsers = () => {
    const [application, setApplication] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();

    useEffect(() => {
        fetchApplication();
        fetchUsers();
    }, [id]);

    const fetchApplication = async () => {
        try {
            const response = await api.get(`/applications/${id}`);
            setApplication(response.data.application);
        } catch (error) {
            toast.error('Failed to load application');
            navigate('/dashboard');
        }
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/applications/${id}/users`);
            setUsers(response.data.users);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveAccess = async (userId, username) => {
        if (!confirm(`Are you sure you want to remove access for ${username}?`)) return;

        try {
            await api.delete(`/applications/${id}/users/${userId}`);
            toast.success(`Access removed for ${username}`);
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to remove access');
        }
    };

    return (
        <Layout>
            <div className="page-header">
                <div className="breadcrumb">
                    <span className="breadcrumb-item" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
                        Dashboard
                    </span>
                    <span className="breadcrumb-separator">›</span>
                    <span className="breadcrumb-item active">Manage Users</span>
                </div>
                <h1 className="page-title">Manage Application Users</h1>
                <p className="page-description">
                    {application ? `View and manage users with access to "${application.name}"` : 'Loading...'}
                </p>
            </div>

            {application && (
                <div className="card" style={{ marginBottom: '24px' }}>
                    <div className="card-body">
                        <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>Application Details</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                            <div>
                                <span style={{ fontSize: '12px', color: 'var(--color-gray-600)', textTransform: 'uppercase', fontWeight: '600' }}>Name</span>
                                <p style={{ margin: '4px 0 0', fontSize: '14px', color: 'var(--color-gray-900)' }}>{application.name}</p>
                            </div>
                            <div>
                                <span style={{ fontSize: '12px', color: 'var(--color-gray-600)', textTransform: 'uppercase', fontWeight: '600' }}>Status</span>
                                <p style={{ margin: '4px 0 0' }}>
                                    <span className={`badge ${application.status === 'active' ? 'success' : 'warning'}`}>
                                        {application.status}
                                    </span>
                                </p>
                            </div>
                            <div>
                                <span style={{ fontSize: '12px', color: 'var(--color-gray-600)', textTransform: 'uppercase', fontWeight: '600' }}>Client ID</span>
                                <p style={{ margin: '4px 0 0', fontSize: '13px', fontFamily: 'monospace', color: 'var(--color-gray-700)' }}>
                                    {application.clientId}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="table-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Users with Access</h3>
                    <span style={{ fontSize: '14px', color: 'var(--color-gray-600)' }}>
                        {users.length} {users.length === 1 ? 'user' : 'users'}
                    </span>
                </div>

                <table className="table">
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Granted On</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>
                                    Loading users...
                                </td>
                            </tr>
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>
                                    No users have access to this application yet.
                                </td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user._id}>
                                    <td>
                                        <strong>{user.username}</strong>
                                    </td>
                                    <td>{user.email}</td>
                                    <td>
                                        <span className="badge" style={{ backgroundColor: '#DBEAFE', color: '#1E40AF' }}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td>
                                        {new Date(user.grantedAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                        })}
                                    </td>
                                    <td>
                                        <div className="table-actions">
                                            <button
                                                className="btn btn-sm btn-secondary"
                                                onClick={() => handleRemoveAccess(user._id, user.username)}
                                            >
                                                ✕ Remove Access
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
                    ← Back to Dashboard
                </button>
                <button className="btn btn-primary" onClick={() => navigate(`/apps/edit/${id}`)}>
                    <Settings size={18} style={{ marginRight: '8px' }} />
                    Edit Application
                </button>
            </div>
        </Layout>
    );
};

export default ManageAppUsers;
