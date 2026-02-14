import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import Layout from '../layout/Layout';
import api from '../../services/api';
import CredentialsModal from './CredentialsModal';
import { useToast } from '../../context/ToastContext';

const RegisterApp = () => {
    const [name, setName] = useState('');
    const [redirectUri, setRedirectUri] = useState('');
    const [roles, setRoles] = useState(['admin', 'editor']);
    const [roleInput, setRoleInput] = useState('');
    const [status, setStatus] = useState('active');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);
    const [showCredentialsModal, setShowCredentialsModal] = useState(false);
    const [credentials, setCredentials] = useState(null);

    const navigate = useNavigate();
    const { id } = useParams();
    const toast = useToast();

    useEffect(() => {
        if (id) {
            setIsEditMode(true);
            fetchApplication();
        }
    }, [id]);

    const fetchApplication = async () => {
        try {
            const response = await api.get(`/applications/${id}`);
            const app = response.data.application;
            setName(app.name);
            setRedirectUri(app.redirectUri);
            setRoles(app.roles || []);
            setStatus(app.status);
        } catch (error) {
            toast.error('Error loading application');
            navigate('/dashboard');
        }
    };

    const handleAddRole = (e) => {
        if (e.key === 'Enter' && roleInput.trim()) {
            e.preventDefault();
            if (!roles.includes(roleInput.trim())) {
                setRoles([...roles, roleInput.trim()]);
            }
            setRoleInput('');
        }
    };

    const handleRemoveRole = (roleToRemove) => {
        setRoles(roles.filter(r => r !== roleToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            new URL(redirectUri);
        } catch (err) {
            setError('Please enter a valid URL for the Redirect URI');
            return;
        }

        setLoading(true);

        try {
            if (isEditMode) {
                await api.put(`/applications/${id}`, {
                    name,
                    redirectUri,
                    roles,
                    status,
                });
                toast.success('Application updated successfully!');
                navigate('/dashboard');
            } else {
                const response = await api.post('/applications', {
                    name,
                    redirectUri,
                    roles,
                });

                // Show credentials modal
                setCredentials(response.data.application);
                setShowCredentialsModal(true);
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Error saving application');
        } finally {
            setLoading(false);
        }
    };

    const handleCredentialsModalClose = () => {
        setShowCredentialsModal(false);
        navigate('/dashboard');
    };

    return (
        <Layout>
            <div className="page-header">
                <div className="breadcrumb">
                    <span className="breadcrumb-item" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
                        Dashboard
                    </span>
                    <span className="breadcrumb-separator">›</span>
                    <span className="breadcrumb-item active">
                        {isEditMode ? 'Edit Application' : 'Register App'}
                    </span>
                </div>
                <h1 className="page-title">
                    {isEditMode ? 'Edit Application' : 'Register New Application'}
                </h1>
                <p className="page-description">
                    {isEditMode
                        ? 'Update your application configuration.'
                        : 'Configure your new application to start using our platform services.'}
                </p>
            </div>

            <div className="card">
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div className="alert warning">
                                <div className="alert-content">
                                    <div className="alert-message">{error}</div>
                                </div>
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label" htmlFor="app-name">App Name</label>
                            <input
                                type="text"
                                id="app-name"
                                className="form-input"
                                placeholder="e.g. My Awesome Mobile App"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                            <p className="form-helper">The name of your application as it will appear in the dashboard.</p>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="redirect-uri">Redirect URI</label>
                            <div className="input-group">
                                <input
                                    type="url"
                                    id="redirect-uri"
                                    className="form-input"
                                    placeholder="https://example.com/callback"
                                    value={redirectUri}
                                    onChange={(e) => setRedirectUri(e.target.value)}
                                    required
                                />
                                <span className="input-icon">🔗</span>
                            </div>
                            <p className="form-helper">The URL to redirect users after authentication.</p>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="custom-roles">Custom Roles</label>
                            <div className="tag-input-wrapper">
                                {roles.map((role) => (
                                    <span key={role} className="tag">
                                        {role}
                                        <span className="tag-remove" onClick={() => handleRemoveRole(role)}>✕</span>
                                    </span>
                                ))}
                                <input
                                    type="text"
                                    id="custom-roles"
                                    className="tag-input"
                                    placeholder="Type a role and press enter..."
                                    value={roleInput}
                                    onChange={(e) => setRoleInput(e.target.value)}
                                    onKeyDown={handleAddRole}
                                />
                            </div>
                            <p className="form-helper">Define custom application roles for permission mapping.</p>
                        </div>

                        {isEditMode && (
                            <div className="form-group">
                                <label className="form-label" htmlFor="status">Status</label>
                                <select
                                    id="status"
                                    className="form-input"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                >
                                    <option value="active">Active</option>
                                    <option value="pending">Pending</option>
                                </select>
                            </div>
                        )}

                        {!isEditMode && (
                            <div className="alert warning">
                                <div className="alert-icon">
                                    <AlertTriangle size={20} />
                                </div>
                                <div className="alert-content">
                                    <div className="alert-title">Security Note</div>
                                    <div className="alert-message">
                                        Upon registration, we will generate a unique <strong>Client ID</strong> and <strong>Client Secret</strong> for your application. Please ensure you store the Client Secret securely, as it will only be shown once.
                                    </div>
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '32px' }}>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => navigate('/dashboard')}
                            >
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Saving...' : (isEditMode ? 'Update Application' : 'Create Application')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Credentials Modal */}
            {showCredentialsModal && credentials && (
                <CredentialsModal
                    credentials={credentials}
                    onClose={handleCredentialsModalClose}
                />
            )}
        </Layout>
    );
};

export default RegisterApp;
