import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Users, Info } from 'lucide-react';
import Layout from '../layout/Layout';
import api from '../../services/api';

const Documentation = () => {
    const [activeTab, setActiveTab] = useState('register');
    const [registerData, setRegisterData] = useState(null);
    const [accessData, setAccessData] = useState(null);
    const [howItWorksData, setHowItWorksData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDocumentation();
    }, []);

    const fetchDocumentation = async () => {
        try {
            const [regRes, accessRes, howRes] = await Promise.all([
                api.get('/docs/registration-tips'),
                api.get('/docs/format-samples'),
                api.get('/docs/api-reference'),
            ]);
            setRegisterData(regRes.data.data);
            setAccessData(accessRes.data.data);
            setHowItWorksData(howRes.data.data);
        } catch (error) {
            console.error('Error fetching documentation:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderFlowGuide = (data) => {
        if (!data) return null;
        return (
            <div className="doc-content">
                <h2 className="doc-title">{data.title}</h2>
                {data.intro && (
                    <p className="doc-intro">{data.intro}</p>
                )}
                {data.sections.map((section, idx) => (
                    <div key={idx} className="doc-section">
                        <h3 className="doc-section-title">{section.heading}</h3>
                        <ol className="doc-steps-list">
                            {section.steps.map((step, stepIdx) => (
                                <li key={stepIdx} className="doc-step-item">
                                    {step}
                                </li>
                            ))}
                        </ol>
                    </div>
                ))}
            </div>
        );
    };

    const tabs = [
        { key: 'register', label: 'Registering an App', icon: <PlusCircle size={18} /> },
        { key: 'access', label: 'Requesting Access', icon: <Users size={18} /> },
        { key: 'how', label: 'How It Works', icon: <Info size={18} /> },
    ];

    return (
        <Layout>
            <div className="page-header">
                <div className="breadcrumb">
                    <span
                        className="breadcrumb-item"
                        onClick={() => navigate('/dashboard')}
                        style={{ cursor: 'pointer' }}
                    >
                        Dashboard
                    </span>
                    <span className="breadcrumb-separator">›</span>
                    <span className="breadcrumb-item active">Documentation</span>
                </div>
                <h1 className="page-title">Documentation</h1>
                <p className="page-description">
                    Learn how to register your app, request access, and understand how DevPortal works.
                </p>
            </div>

            <div className="doc-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        className={`doc-tab ${activeTab === tab.key ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            <div className="doc-container">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: 'var(--color-gray-500)' }}>
                        Loading documentation...
                    </div>
                ) : (
                    <>
                        {activeTab === 'register' && renderFlowGuide(registerData)}
                        {activeTab === 'access' && renderFlowGuide(accessData)}
                        {activeTab === 'how' && renderFlowGuide(howItWorksData)}
                    </>
                )}
            </div>
        </Layout>
    );
};

export default Documentation;
