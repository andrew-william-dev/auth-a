import { useState } from 'react';
import { Copy, Check, AlertTriangle } from 'lucide-react';

const CredentialsModal = ({ credentials, onClose }) => {
    const [copiedField, setCopiedField] = useState(null);

    const copyToClipboard = async (text, field) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedField(field);
            setTimeout(() => setCopiedField(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal credentials-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">🎉 Application Created Successfully!</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    <div className="alert warning" style={{ marginBottom: '24px' }}>
                        <div className="alert-content">
                            <div className="alert-message">
                                <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                                <span><strong>Important:</strong> Save these credentials securely. The Client Secret will not be shown again!</span>
                            </div>
                        </div>
                    </div>

                    <div className="credentials-section">
                        <div className="credential-item">
                            <label className="credential-label">Client ID</label>
                            <div className="credential-value-container">
                                <code className="credential-value">{credentials.clientId}</code>
                                <button
                                    className="btn btn-icon btn-secondary"
                                    onClick={() => copyToClipboard(credentials.clientId, 'clientId')}
                                    title="Copy Client ID"
                                >
                                    {copiedField === 'clientId' ? <Check size={16} /> : <Copy size={16} />}
                                </button>
                            </div>
                            {copiedField === 'clientId' && (
                                <span className="copy-success">Copied!</span>
                            )}
                        </div>

                        <div className="credential-item">
                            <label className="credential-label">Client Secret</label>
                            <div className="credential-value-container">
                                <code className="credential-value secret">{credentials.clientSecret}</code>
                                <button
                                    className="btn btn-icon btn-secondary"
                                    onClick={() => copyToClipboard(credentials.clientSecret, 'clientSecret')}
                                    title="Copy Client Secret"
                                >
                                    {copiedField === 'clientSecret' ? <Check size={16} /> : <Copy size={16} />}
                                </button>
                            </div>
                            {copiedField === 'clientSecret' && (
                                <span className="copy-success">Copied!</span>
                            )}
                        </div>
                    </div>

                    <div className="credentials-info">
                        <p>
                            <strong>Application Name:</strong> {credentials.name}
                        </p>
                        <p>
                            <strong>Redirect URI:</strong> {credentials.redirectUri}
                        </p>
                        <p>
                            <strong>Status:</strong> <span className="badge success">{credentials.status}</span>
                        </p>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn btn-primary" onClick={onClose} style={{ width: '100%' }}>
                        I've Saved My Credentials
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CredentialsModal;
