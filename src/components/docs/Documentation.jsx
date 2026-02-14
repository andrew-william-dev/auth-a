import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Code, BookOpen, Lock } from 'lucide-react';
import Layout from '../layout/Layout';
import api from '../../services/api';

const Documentation = () => {
    const [activeTab, setActiveTab] = useState('tips');
    const [tips, setTips] = useState(null);
    const [samples, setSamples] = useState(null);
    const [apiDocs, setApiDocs] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDocumentation();
    }, []);

    const fetchDocumentation = async () => {
        try {
            const [tipsRes, samplesRes, apiRes] = await Promise.all([
                api.get('/docs/registration-tips'),
                api.get('/docs/format-samples'),
                api.get('/docs/api-reference'),
            ]);

            setTips(tipsRes.data.data);
            setSamples(samplesRes.data.data);
            setApiDocs(apiRes.data.data);
        } catch (error) {
            console.error('Error fetching documentation:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderTips = () => {
        if (!tips) return null;

        return (
            <div className="doc-content">
                <h2 className="doc-title">{tips.title}</h2>
                {tips.sections.map((section, idx) => (
                    <div key={idx} className="doc-section">
                        <h3 className="doc-section-title">{section.heading}</h3>
                        <ul className="doc-list">
                            {section.tips.map((tip, tipIdx) => (
                                <li key={tipIdx} className="doc-list-item">{tip}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        );
    };

    const renderSamples = () => {
        if (!samples) return null;

        return (
            <div className="doc-content">
                <h2 className="doc-title">{samples.title}</h2>
                {samples.sections.map((section, idx) => (
                    <div key={idx} className="doc-section">
                        <h3 className="doc-section-title">{section.heading}</h3>
                        <div className="code-block">
                            <div className="code-header">
                                <span className="code-language">{section.language}</span>
                            </div>
                            <pre className="code-content">
                                <code>{section.code}</code>
                            </pre>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderApiDocs = () => {
        if (!apiDocs) return null;

        return (
            <div className="doc-content">
                <h2 className="doc-title">{apiDocs.title}</h2>
                <div className="api-base-url">
                    <strong>Base URL:</strong> <code>{apiDocs.baseUrl}</code>
                </div>

                {apiDocs.endpoints.map((category, idx) => (
                    <div key={idx} className="doc-section">
                        <h3 className="doc-section-title">{category.category}</h3>
                        {category.endpoints.map((endpoint, endIdx) => (
                            <div key={endIdx} className="api-endpoint">
                                <div className="api-endpoint-header">
                                    <span className={`api-method ${endpoint.method.toLowerCase()}`}>
                                        {endpoint.method}
                                    </span>
                                    <code className="api-path">{endpoint.path}</code>
                                    {endpoint.auth && (
                                        <span className="api-auth-badge">
                                            <Lock size={14} style={{ marginRight: '4px' }} />
                                            Auth Required
                                        </span>
                                    )}
                                </div>
                                <p className="api-description">{endpoint.description}</p>

                                {endpoint.body && (
                                    <div className="api-params">
                                        <strong>Request Body:</strong>
                                        <pre className="api-code">
                                            <code>{JSON.stringify(endpoint.body, null, 2)}</code>
                                        </pre>
                                    </div>
                                )}

                                {endpoint.query && (
                                    <div className="api-params">
                                        <strong>Query Parameters:</strong>
                                        <pre className="api-code">
                                            <code>{JSON.stringify(endpoint.query, null, 2)}</code>
                                        </pre>
                                    </div>
                                )}

                                {endpoint.response && (
                                    <div className="api-params">
                                        <strong>Response:</strong>
                                        <pre className="api-code">
                                            <code>{JSON.stringify(endpoint.response, null, 2)}</code>
                                        </pre>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <Layout>
            <div className="page-header">
                <div className="breadcrumb">
                    <span className="breadcrumb-item" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
                        Dashboard
                    </span>
                    <span className="breadcrumb-separator">›</span>
                    <span className="breadcrumb-item active">Documentation</span>
                </div>
                <h1 className="page-title">Documentation</h1>
                <p className="page-description">
                    Learn how to integrate with the DevPortal platform and manage your applications.
                </p>
            </div>

            <div className="doc-tabs">
                <button
                    className={`doc-tab ${activeTab === 'tips' ? 'active' : ''}`}
                    onClick={() => setActiveTab('tips')}
                >
                    <FileText size={18} />
                    <span>Registration Tips</span>
                </button>
                <button
                    className={`doc-tab ${activeTab === 'samples' ? 'active' : ''}`}
                    onClick={() => setActiveTab('samples')}
                >
                    <Code size={18} />
                    <span>Code Samples</span>
                </button>
                <button
                    className={`doc-tab ${activeTab === 'api' ? 'active' : ''}`}
                    onClick={() => setActiveTab('api')}
                >
                    <BookOpen size={18} />
                    <span>API Reference</span>
                </button>
            </div>

            <div className="doc-container">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px' }}>
                        Loading documentation...
                    </div>
                ) : (
                    <>
                        {activeTab === 'tips' && renderTips()}
                        {activeTab === 'samples' && renderSamples()}
                        {activeTab === 'api' && renderApiDocs()}
                    </>
                )}
            </div>
        </Layout>
    );
};

export default Documentation;
