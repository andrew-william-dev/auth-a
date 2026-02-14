import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import Layout from '../layout/Layout';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const ManageRequests = () => {
    const [applications, setApplications] = useState([]);
    const [selectedApp, setSelectedApp] = useState(null);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [requestsLoading, setRequestsLoading] = useState(false);
    const navigate = useNavigate();
    const toast = useToast();

    useEffect(() => {
        fetchAdminApplications();
    }, []);

    const fetchAdminApplications = async () => {
        try {
            setLoading(true);
            const response = await api.get('/applications');
            // Filter only apps where user is admin
            const adminApps = response.data.applications.filter(app => app.isAdmin);
            setApplications(adminApps);

            if (adminApps.length > 0) {
                setSelectedApp(adminApps[0]);
                fetchPendingRequests(adminApps[0]._id);
            }
        } catch (error) {
            console.error('Error fetching applications:', error);
            toast.error('Failed to load applications');
        } finally {
            setLoading(false);
        }
    };

    const fetchPendingRequests = async (appId) => {
        try {
            setRequestsLoading(true);
            const response = await api.get(`/access-requests/pending/${appId}`);
            setRequests(response.data.requests);
        } catch (error) {
            console.error('Error fetching requests:', error);
            toast.error('Failed to load pending requests');
        } finally {
            setRequestsLoading(false);
        }
    };

    const handleAppChange = (app) => {
        setSelectedApp(app);
        fetchPendingRequests(app._id);
    };

    const handleApprove = async (requestId) => {
        try {
            await api.put(`/access-requests/${requestId}/approve`);
            toast.success('Access request approved successfully');
            fetchPendingRequests(selectedApp._id);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to approve request');
        }
    };

    const handleDeny = async (requestId) => {
        try {
            await api.put(`/access-requests/${requestId}/deny`);
            toast.success('Access request denied');
            fetchPendingRequests(selectedApp._id);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to deny request');
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
                    <span className="breadcrumb-item active">Manage Requests</span>
                </div>
                <h1 className="page-title">Manage Access Requests</h1>
                <p className="page-description">
                    Review and approve access requests for your applications.
                </p>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px' }}>
                    Loading...
                </div>
            ) : applications.length === 0 ? (
                <div className="alert warning">
                    <div className="alert-content">
                        <div className="alert-message">
                            You don't have admin access to any applications yet.
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {/* Application Selector */}
                    <div className="form-group" style={{ maxWidth: '400px', marginBottom: '32px' }}>
                        <label className="form-label">Select Application</label>
                        <select
                            className="form-input"
                            value={selectedApp?._id || ''}
                            onChange={(e) => {
                                const app = applications.find(a => a._id === e.target.value);
                                handleAppChange(app);
                            }}
                        >
                            {applications.map(app => (
                                <option key={app._id} value={app._id}>
                                    {app.name} ({requests.filter(r => r.applicationId === app._id).length} pending)
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Requests Table */}
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Email</th>
                                    <th>Requested Role</th>
                                    <th>Message</th>
                                    <th>Requested On</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requestsLoading ? (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                                            Loading requests...
                                        </td>
                                    </tr>
                                ) : requests.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                                            No pending requests for this application.
                                        </td>
                                    </tr>
                                ) : (
                                    requests.map((request) => (
                                        <tr key={request._id}>
                                            <td>
                                                <strong>{request.userId.username}</strong>
                                            </td>
                                            <td>{request.userId.email}</td>
                                            <td>
                                                <span className="badge" style={{ backgroundColor: '#DBEAFE', color: '#1E40AF' }}>
                                                    {request.requestedRole}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {request.message || '-'}
                                                </div>
                                            </td>
                                            <td>
                                                {new Date(request.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                })}
                                            </td>
                                            <td>
                                                <div className="table-actions">
                                                    <button
                                                        className="btn btn-sm btn-primary"
                                                        onClick={() => handleApprove(request._id)}
                                                        style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-1)' }}
                                                    >
                                                        <Check size={16} />
                                                        Approve
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-secondary"
                                                        onClick={() => handleDeny(request._id)}
                                                        style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-1)' }}
                                                    >
                                                        <X size={16} />
                                                        Deny
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </Layout>
    );
};

export default ManageRequests;
