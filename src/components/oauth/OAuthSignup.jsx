import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { UserPlus, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const OAuthSignup = () => {
    const [searchParams] = useSearchParams();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const toast = useToast();

    // Preserve OAuth parameters
    const clientId = searchParams.get('clientId');
    const redirectUrl = searchParams.get('redirectUrl');
    const codeChallenge = searchParams.get('code_challenge');
    const codeChallengeMethod = searchParams.get('code_challenge_method');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            await api.post('/auth/signup', {
                username,
                email,
                password,
            });

            toast.success('Account created successfully! Please sign in.');

            // Redirect back to OAuth login with parameters
            navigate(`/oauth/login?clientId=${clientId}&redirectUrl=${encodeURIComponent(redirectUrl)}&code_challenge=${codeChallenge}&code_challenge_method=${codeChallengeMethod}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Signup failed');
            setLoading(false);
        }
    };

    return (
        <div className="oauth-container">
            <div className="oauth-card">
                <div className="oauth-header">
                    <div className="oauth-icon-wrapper">
                        <UserPlus size={40} strokeWidth={1.5} />
                    </div>
                    <h1>Create Account</h1>
                    <p className="oauth-app-info-text">
                        Sign up to authorize the application
                    </p>
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
                        <label className="form-label" htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            className="form-input"
                            placeholder="johndoe"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>

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
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            className="form-input"
                            placeholder="At least 6 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            className="form-input"
                            placeholder="Re-enter your password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary oauth-submit-btn" disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 size={18} className="btn-spinner" />
                                Creating Account...
                            </>
                        ) : (
                            <>
                                Create Account
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div className="oauth-footer">
                    <p className="oauth-footer-text">
                        Already have an account?{' '}
                        <Link
                            to={`/oauth/login?clientId=${clientId}&redirectUrl=${encodeURIComponent(redirectUrl)}&code_challenge=${codeChallenge}&code_challenge_method=${codeChallengeMethod}`}
                            className="oauth-link"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OAuthSignup;
