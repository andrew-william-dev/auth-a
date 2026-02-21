import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Shield, AlertCircle, Loader2, ArrowRight, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const OAuthLogin = () => {
    const [searchParams] = useSearchParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [validating, setValidating] = useState(true);
    const [autoRedirecting, setAutoRedirecting] = useState(false);
    const [error, setError] = useState('');
    const [application, setApplication] = useState(null);
    const navigate = useNavigate();
    const toast = useToast();

    // Get OAuth parameters from URL
    const clientId = searchParams.get('clientId');
    const redirectUrl = searchParams.get('redirectUrl');
    const codeChallenge = searchParams.get('code_challenge');
    const codeChallengeMethod = searchParams.get('code_challenge_method');

    useEffect(() => {
        validateAndCheckSession();
    }, []);

    // Decode JWT payload without verifying signature (verification is done server-side)
    const getTokenPayload = (token) => {
        try {
            const base64Payload = token.split('.')[1];
            const payload = JSON.parse(atob(base64Payload));
            return payload;
        } catch {
            return null;
        }
    };

    const isTokenValid = (token) => {
        const payload = getTokenPayload(token);
        if (!payload || !payload.exp) return false;
        // Check if token expires more than 30 seconds from now
        return payload.exp * 1000 > Date.now() + 30000;
    };

    const validateAndCheckSession = async () => {
        // Check if all required parameters are present
        if (!clientId || !redirectUrl || !codeChallenge || !codeChallengeMethod) {
            setError('Missing required OAuth parameters');
            setValidating(false);
            return;
        }

        try {
            // Validate the OAuth request first
            const response = await api.get('/oauth/validate', {
                params: {
                    clientId,
                    redirectUrl,
                    code_challenge: codeChallenge,
                    code_challenge_method: codeChallengeMethod,
                },
            });

            setApplication(response.data.application);

            // Now check for an existing valid DevPortal session token
            const storedToken = localStorage.getItem('token');
            if (storedToken && isTokenValid(storedToken)) {
                // Valid session found - auto-authorize and redirect
                setValidating(false);
                setAutoRedirecting(true);
                await autoAuthorize(storedToken);
            } else {
                setValidating(false);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid OAuth request');
            setValidating(false);
        }
    };

    const autoAuthorize = async (token) => {
        try {
            const response = await api.post('/oauth/authorize-with-token', {
                token,
                clientId,
                redirectUrl,
                code_challenge: codeChallenge,
                code_challenge_method: codeChallengeMethod,
            });

            const authCode = response.data.code;
            const separator = redirectUrl.includes('?') ? '&' : '?';
            window.location.href = `${redirectUrl}${separator}code=${authCode}`;
        } catch (err) {
            // Session might be valid locally but invalid on server (e.g. user lost access)
            // Fall back to the login form
            setAutoRedirecting(false);
            const errMsg = err.response?.data?.message || null;
            if (errMsg) setError(errMsg);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/oauth/authorize', {
                email,
                password,
                clientId,
                redirectUrl,
                code_challenge: codeChallenge,
                code_challenge_method: codeChallengeMethod,
            });

            // Redirect to application with authorization code
            const authCode = response.data.code;
            const separator = redirectUrl.includes('?') ? '&' : '?';
            window.location.href = `${redirectUrl}${separator}code=${authCode}`;
        } catch (err) {
            setError(err.response?.data?.message || 'Authentication failed');
            setLoading(false);
        }
    };

    // --- Loading / Validating State ---
    if (validating) {
        return (
            <div className="oauth-container">
                <div className="oauth-card">
                    <div className="oauth-loader">
                        <Loader2 className="oauth-spinner" size={48} />
                        <p>Validating authorization request...</p>
                    </div>
                </div>
            </div>
        );
    }

    // --- Error State (invalid OAuth request) ---
    if (error && !application) {
        return (
            <div className="oauth-container">
                <div className="oauth-card">
                    <div className="oauth-error">
                        <AlertCircle size={64} className="error-icon-svg" />
                        <h2>Authorization Error</h2>
                        <p className="error-message">{error}</p>
                        <div className="error-details">
                            <p><strong>Common issues:</strong></p>
                            <ul>
                                <li>Invalid or missing client ID</li>
                                <li>Redirect URL doesn't match registered URI</li>
                                <li>Missing PKCE parameters</li>
                                <li>Invalid code challenge method (must be S256)</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- Auto-redirecting (valid session found) ---
    if (autoRedirecting) {
        return (
            <div className="oauth-container">
                <div className="oauth-card">
                    <div className="oauth-loader">
                        <CheckCircle size={48} style={{ color: 'var(--color-success)' }} />
                        <p style={{ marginTop: '16px', fontWeight: 600 }}>Session found!</p>
                        <p style={{ color: 'var(--color-gray-500)', fontSize: '0.875rem', marginTop: '4px' }}>
                            Redirecting you to <strong>{application?.name}</strong>...
                        </p>
                        <Loader2 className="oauth-spinner" size={24} style={{ marginTop: '16px' }} />
                    </div>
                </div>
            </div>
        );
    }

    // --- Normal Login Form ---
    return (
        <div className="oauth-container">
            <div className="oauth-card">
                <div className="oauth-header">
                    <div className="oauth-icon-wrapper">
                        <Shield size={40} strokeWidth={1.5} />
                    </div>
                    <h1>Authorize Application</h1>
                    <div className="oauth-app-info">
                        <p className="oauth-app-label">Application requesting access:</p>
                        <p className="oauth-app-name">{application?.name}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="oauth-form">
                    {error && (
                        <div className="alert warning" style={{ marginBottom: '20px' }}>
                            <AlertCircle size={18} />
                            <div className="alert-content">
                                <div className="alert-message">{error}</div>
                            </div>
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label" htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            className="form-input"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            className="form-input"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary oauth-submit-btn" disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 size={18} className="btn-spinner" />
                                Authorizing...
                            </>
                        ) : (
                            <>
                                Authorize
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div className="oauth-footer">
                    <p className="oauth-footer-text">
                        Don't have an account?{' '}
                        <Link
                            to={`/oauth/signup?clientId=${clientId}&redirectUrl=${encodeURIComponent(redirectUrl)}&code_challenge=${codeChallenge}&code_challenge_method=${codeChallengeMethod}`}
                            className="oauth-link"
                        >
                            Create one
                        </Link>
                    </p>
                    <div className="oauth-consent-notice">
                        <p>
                            By authorizing, you allow <strong>{application?.name}</strong> to access your DevPortal account information.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OAuthLogin;
