import { useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const AccessRequestModal = ({ app, onClose, onSuccess }) => {
    const [selectedRole, setSelectedRole] = useState(app.roles[0] || '');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const toast = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!selectedRole) {
            setError('Please select a role');
            return;
        }

        setLoading(true);

        try {
            await api.post('/access-requests', {
                applicationId: app._id,
                requestedRole: selectedRole,
                message,
            });

            toast.success('Access request submitted successfully!');
            onSuccess();
            onClose();
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to submit request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Request Access</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {error && (
                            <div className="alert warning">
                                <div className="alert-content">
                                    <div className="alert-message">{error}</div>
                                </div>
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label">Application</label>
                            <input
                                type="text"
                                className="form-input"
                                value={app.name}
                                disabled
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="role">Select Role</label>
                            <select
                                id="role"
                                className="form-input"
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                                required
                            >
                                <option value="">Choose a role...</option>
                                {app.roles.map((role) => (
                                    <option key={role} value={role}>{role}</option>
                                ))}
                            </select>
                            <p className="form-helper">Select the role you need for this application</p>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="message">Message (Optional)</label>
                            <textarea
                                id="message"
                                className="form-input"
                                rows="4"
                                placeholder="Explain why you need access to this application..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                style={{ resize: 'vertical' }}
                            />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AccessRequestModal;
