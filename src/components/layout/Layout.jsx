import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    return (
        <div className="app-container">
            <Sidebar />
            <main className="main-content">
                <div className="content-wrapper fade-in">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
