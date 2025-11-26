import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { LogOut, LayoutDashboard, Package, Warehouse, Users, FileText, ShoppingCart, Search, Bell, ArrowLeft } from 'lucide-react';

const API_BASE_URL = "";
const API_KEY = ""; 

const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [role, setRole] = useState('Staff');
    const [isLoading, setIsLoading] = useState(false); 

    useEffect(() => {
        setIsLoading(false); 
    }, []);

    const login = useCallback((userRole) => {
        setIsLoading(true);
        setTimeout(() => {
            setRole(userRole);
            setIsAuthenticated(true);
            setIsLoading(false);
        }, 300);
    }, []);

    const logout = useCallback(() => {
        setIsAuthenticated(false);
        setRole(null);
    }, []);

    return { isAuthenticated, role, isLoading, login, logout };
};

const PageHeader = ({ icon: Icon, title, description, role }) => (
    <div className="flex items-start justify-between p-4 bg-white shadow-lg rounded-xl mb-6 border-b-4 border-indigo-500">
        <div className="flex items-center">
            <div className="p-3 mr-4 bg-indigo-100 rounded-full text-indigo-600">
                <Icon size={24} />
            </div>
            <div>
                <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
                <p className="text-sm text-gray-500">{description}</p>
            </div>
        </div>
        <div className="px-3 py-1 text-xs font-medium text-white bg-indigo-500 rounded-full shadow-md self-center">
            Role: {role}
        </div>
    </div>
);

const NavButton = ({ icon: Icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center w-full px-4 py-3 my-1 transition-all duration-200 rounded-lg group ${
            isActive
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-indigo-200 hover:bg-indigo-700/50 hover:text-white'
        }`}
    >
        <Icon size={20} className="mr-3 transition-transform group-hover:scale-110" />
        <span className="font-medium text-sm">{label}</span>
    </button>
);

const Dashboard = ({ role }) => {
    const [analysis, setAnalysis] = useState('Loading key metrics and alerts...');

    const fetchAnalysis = useCallback(async () => {
        if (!API_KEY) {
            setAnalysis(
                'Inventory \n' +
                'Order Rate \n' +
                'Top Alert.'
            );
            return;
        }

        const userQuery = `Generate a concise summary of three key performance indicators (KPIs) for a modern warehouse management system dashboard: Inventory Accuracy, Order Fulfillment Rate, and Top Alert (e.g., "30 products below reorder point"). Format it for a manager's quick review.`;
        
        try {
            const payload = {
                contents: [{ parts: [{ text: userQuery }] }],
                tools: [{ "google_search": {} }],
            };

            // Using exponential backoff for robustness
            for (let attempt = 0; attempt < 3; attempt++) {
                const response = await fetch(`${API_BASE_URL}?key=${API_KEY}`, { // Include API key in URL for fetch
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (response.status === 429 && attempt < 2) {
                    await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
                    continue; // Retry
                }

                if (!response.ok) throw new Error(`API call failed with status: ${response.status}`);

                const result = await response.json();
                const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "Analysis failed to load.";
                setAnalysis(text);
                return;
            }
        } catch (error) {
            console.error("Error fetching analysis:", error);
            setAnalysis('Failed to fetch real-time analysis due to API error. Using mock data.');
        }
    }, []);

    useEffect(() => {
        fetchAnalysis();
    }, [fetchAnalysis]);

    return (
        <>
            <PageHeader icon={LayoutDashboard} title="WMS Dashboard" description="Real-time status, key metrics, and immediate alerts." role={role} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Key Performance Indicators (KPIs)</h2>
                    <div className="text-gray-600 space-y-3">
                        {analysis.split('\n').map((line, index) => (
                            <p key={index} className="text-base leading-relaxed">{line}</p>
                        ))}
                        {!API_KEY && (
                            <p className="text-red-500 pt-2 text-sm italic">
                                Note: API_KEY is missing. Mock data on display.
                            </p>
                        )}
                    </div>
                </div>
                <AlertsPanel />
            </div>
            <div className="mt-6 p-6 bg-white rounded-xl shadow-lg">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Visual Analytics (Req. 5)</h2>
                <div className="h-64 flex items-center justify-center text-gray-400 border border-dashed rounded-lg">
                    [Placeholder for Charts: Inventory by Category, Fulfillment Trend]
                </div>
            </div>
        </>
    );
};

const InventoryManagement = ({ role }) => (
    <>
        <PageHeader icon={Package} title="Inventory Control" description="Manage product details, stock levels, and locations (Req. 2, 6)." role={role} />
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Product Catalog (CRUD & Search)</h2>
            <div className="flex justify-between mb-4">
                <input
                    type="text"
                    placeholder="Search by ID, Name, or Category (Req. 6)"
                    className="p-2 border border-gray-300 rounded-lg w-1/3 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-150 shadow-md">
                    + Add New Product
                </button>
            </div>
            <div className="h-96 overflow-y-auto border rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <tr key={i} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">PROD-{1000 + i}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Widget Alpha {i}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{150 - i * 10}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Aisle-0{i} / Shelf-C</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${i % 3 === 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                        {i % 3 === 0 ? 'Low Stock' : 'In Stock'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button className="text-indigo-600 hover:text-indigo-900 ml-2">Edit</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </>
);

const OperationsManagement = ({ role }) => (
    <>
        <PageHeader icon={Warehouse} title="Warehouse Operations" description="Manage inbound receiving, outbound picking, and real-time movement." role={role} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <OperationCard title="Inbound Receiving" icon="📥" color="bg-blue-100 text-blue-800" buttonText="Start Receiving">
                System records product receipt, updates inventory, and facilitates location assignment.
            </OperationCard>
            <OperationCard title="Outbound Fulfillment" icon="📤" color="bg-red-100 text-red-800" buttonText="Process Orders">
                Supports picking, packing, and shipping processes. Optimizes retrieval paths.
            </OperationCard>
        </div>
        <div className="mt-6 bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Product Movement Tracking</h2>
            <p className="text-gray-500">Real-time recording of product movement to minimize delays and provide full traceability.</p>
            <div className="h-40 flex items-center justify-center text-gray-400 border border-dashed rounded-lg mt-4">
                [Placeholder: Live map of storage locations or movement timeline]
            </div>
        </div>
    </>
);

const OperationCard = ({ title, icon, color, buttonText, children }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col justify-between">
        <div>
            <div className={`w-12 h-12 ${color} rounded-full flex items-center justify-center text-2xl mb-4`}>
                {icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
            <p className="text-gray-600 text-sm mb-4">{children}</p>
        </div>
        <button className="w-full bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition duration-150 shadow-md">
            {buttonText}
        </button>
    </div>
);

const OrderManagement = ({ role }) => (
    <>
        <PageHeader icon={ShoppingCart} title="Order & Shipment Management" description="Record, process, and track customer orders from confirmation to delivery (Req. 4)." role={role} />
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Customer Orders List</h2>
            <div className="h-96 overflow-y-auto border rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shipment Tracking</th>
                            <th className="px-6 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {[101, 102, 103, 104, 105].map(id => (
                            <tr key={id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">ORD-{id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Customer {id} Corp.</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${id % 2 === 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                                        {id % 2 === 0 ? 'In Picking' : 'Dispatched'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">TRK-{Math.floor(Math.random() * 90000) + 10000}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button className="text-indigo-600 hover:text-indigo-900 ml-2">View Receipt</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </>
);

const ReportsAndAnalytics = ({ role }) => (
    <>
        <PageHeader icon={FileText} title="Reports & Analytics" description="Generate detailed reports and analyze warehouse performance (Req. 5)." role={role} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ReportCard title="Inventory Level Report" description="Current stock, value, and reorder status." />
            <ReportCard title="Product Movement History" description="Trace items by date, location, and personnel (Req. 6)." />
            <ReportCard title="Transaction Summary" description="Detailed log of all receipt, transfer, and dispatch transactions." />
        </div>
    </>
);

const ReportCard = ({ title, description }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-500 text-sm mb-4">{description}</p>
        <button className="w-full bg-pink-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-pink-600 transition duration-150">
            Generate Report
        </button>
    </div>
);

const AdminUserManagement = ({ role }) => (
    <>
        <PageHeader icon={Users} title="User & Access Management" description="Create, update, and manage user roles and accounts (Req. 1)." role={role} />
        {role === 'Admin' ? (
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">User Accounts (CRUD)</h2>
                <div className="flex justify-end mb-4">
                    <button className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition duration-150 shadow-md">
                        + Add New User
                    </button>
                </div>
                <div className="h-96 overflow-y-auto border rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {['Admin', 'Manager', 'Staff', 'Staff'].map((r, i) => (
                                <tr key={i} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">User {i+1}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{r.toLowerCase()}@{i}.com</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{r}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button className="text-red-600 hover:text-red-900 ml-2">Remove</button>
                                        <button className="text-indigo-600 hover:text-indigo-900 ml-2">Edit</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        ) : (
            <div className="p-10 text-center bg-yellow-50 rounded-xl border border-yellow-200 text-yellow-800">
                <p className="font-semibold">Access Denied</p>
                <p className="text-sm">You must have an Admin role to view and manage users.</p>
            </div>
        )}
    </>
);

const AlertsPanel = () => (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-red-200">
        <div className="flex items-center text-red-600 mb-4">
            <Bell size={20} className="mr-2 fill-red-100" />
            <h2 className="text-xl font-semibold">Notifications & Alerts</h2>
        </div>
        <ul className="space-y-3 text-sm">
            <li className="p-3 bg-red-50 rounded-lg border-l-4 border-red-500 text-red-700">
                ⚠️ Low Stocks
            </li>
            <li className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-500 text-yellow-700">
                ⏳ Delays
            </li>
            <li className="p-3 bg-indigo-50 rounded-lg border-l-4 border-indigo-500 text-indigo-700">
                🗓️ Reminders
            </li>
        </ul>
    </div>
);

const LoginPage = ({ login }) => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const [regName, setRegName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regAddress, setRegAddress] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regPosition, setRegPosition] = useState('Staff'); 

    const handleLogin = (e) => {
        e.preventDefault();
        setError('');

        if (username === 'admin' && password === '123') {
            login('Admin');
        } else if (username === 'manager' && password === '123') {
            login('Manager');
        } else if (username === 'staff' && password === '123') {
            login('Staff');
        } else {
            setError('Invalid credentials. Try "admin", "manager", or "staff" with password "123".');
        }
    };

    const handleRegister = (e) => {
        e.preventDefault();
        setError('');
        
        if (!regName || !regEmail || !regAddress || !regPosition || !regPassword) {
            setError('Please fill out all registration fields.');
            return;
        }
        
        login(regPosition); 
        
        setRegName('');
        setRegEmail('');
        setRegAddress('');
        setRegPassword('');
        setRegPosition('Staff');
        setIsRegistering(false);
    };

    const renderLoginForm = () => (
        <form onSubmit={handleLogin} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Username
                </label>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="mt-1 w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                    placeholder="e.g., admin, manager, staff"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Password
                </label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="mt-1 w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                    placeholder="Password"
                />
            </div>
            {error && (
                <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm border border-red-300">
                    {error}
                </div>
            )}
            <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200"
            >
                Sign In
            </button>
            <button
                type="button"
                onClick={() => { setIsRegistering(true); setError(''); }}
                className="w-full text-center py-3 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition duration-200 border-t pt-4 mt-6"
            >
                Need an account? Create one here.
            </button>
        </form>
    );

    const renderRegisterForm = () => (
        <form onSubmit={handleRegister} className="space-y-4">
            <button
                type="button"
                onClick={() => { setIsRegistering(false); setError(''); }}
                className="flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 mb-4 transition duration-150"
            >
                <ArrowLeft size={16} className="mr-1" /> Back to Sign In
            </button>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Full Name
                    </label>
                    <input
                        type="text"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        required
                        className="mt-1 w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="John Doe"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Email (for login)
                    </label>
                    <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        required
                        className="mt-1 w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="john@wms.com"
                    />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Address / Location
                </label>
                <input
                    type="text"
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    required
                    className="mt-1 w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="123 Warehouse St."
                />
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Position / Role
                    </label>
                    <select
                        value={regPosition}
                        onChange={(e) => setRegPosition(e.target.value)}
                        required
                        className="mt-1 w-full p-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="Staff">Staff (Operations)</option>
                        <option value="Manager">Manager (Inventory/Orders)</option>
                        <option value="Admin">Admin (Full Access)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Set Password
                    </label>
                    <input
                        type="password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        required
                        className="mt-1 w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Choose a password"
                    />
                </div>
            </div>
            
            {error && (
                <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm border border-red-300">
                    {error}
                </div>
            )}

            <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-lg font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-200 mt-6"
            >
                Create Account & Sign In
            </button>
        </form>
    );

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-2xl">
                <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-6">
                    {isRegistering ? 'WMS Account Registration' : 'WMS Secure Login'}
                </h2>
                <p className="text-sm text-center text-gray-500 mb-8">
                    {isRegistering 
                        ? 'Enter your details to create your system access.'
                        : 'Enter your credentials to access the system.'
                    }
                </p>
                
                {isRegistering ? renderRegisterForm() : renderLoginForm()}
                
                <p className="mt-6 text-xs text-center text-gray-500">
                    {isRegistering 
                        ? '*New accounts are simulated for this demo and grant immediate access.'
                        : '*This demo uses fixed login credentials (admin/manager/staff, pass: 123) or try the registration page.'
                    }
                </p>
            </div>
        </div>
    );
};

const App = () => {
    const { isAuthenticated, role, isLoading, login, logout } = useAuth();
    const [currentPage, setCurrentPage] = useState('dashboard');

    useEffect(() => {
        if (isAuthenticated) {
            setCurrentPage('dashboard');
        } else {
            setCurrentPage('login');
        }
    }, [isAuthenticated]);

    const navItems = useMemo(() => [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'Manager', 'Staff'] },
        { id: 'inventory', label: 'Inventory Management', icon: Package, roles: ['Admin', 'Manager', 'Staff'] },
        { id: 'orders', label: 'Order Management', icon: ShoppingCart, roles: ['Admin', 'Manager', 'Staff'] },
        { id: 'operations', label: 'Warehouse Operations', icon: Warehouse, roles: ['Admin', 'Manager', 'Staff'] },
        { id: 'reports', label: 'Reports & Analytics', icon: FileText, roles: ['Admin', 'Manager'] },
        { id: 'admin', label: 'User Management', icon: Users, roles: ['Admin'] },
    ], []);

    const filteredNavItems = navItems.filter(item => item.roles.includes(role));

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex items-center justify-center h-full min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            );
        }

        if (!isAuthenticated) {
            return <LoginPage login={login} />;
        }

        switch (currentPage) {
            case 'dashboard':
                return <Dashboard role={role} />;
            case 'inventory':
                return <InventoryManagement role={role} />;
            case 'orders':
                return <OrderManagement role={role} />;
            case 'operations':
                return <OperationsManagement role={role} />;
            case 'reports':
                return <ReportsAndAnalytics role={role} />;
            case 'admin':
                return <AdminUserManagement role={role} />;
            default:
                return <Dashboard role={role} />;
        }
    };

    if (!isAuthenticated) {
        return renderContent();
    }

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            {/* Sidebar Navigation */}
            <div className="w-64 bg-indigo-800 p-4 flex flex-col justify-between shadow-2xl transition-all duration-300">
                <div>
                    <div className="text-white text-2xl font-bold py-4 mb-6 tracking-wide border-b border-indigo-700">
                        WMS Central
                    </div>
                    <nav className="space-y-1">
                        {filteredNavItems.map(item => (
                            <NavButton
                                key={item.id}
                                icon={item.icon}
                                label={item.label}
                                isActive={currentPage === item.id}
                                onClick={() => setCurrentPage(item.id)}
                            />
                        ))}
                    </nav>
                </div>

                {/* Footer/Logout */}
                <div className="pt-4 border-t border-indigo-700">
                    <div className="text-indigo-200 text-sm mb-2 px-3">
                        Logged in as: <span className="font-semibold">{role}</span>
                    </div>
                    <NavButton
                        icon={LogOut}
                        label="Logout"
                        isActive={false}
                        onClick={logout}
                    />
                </div>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto p-4 md:p-8">
                {renderContent()}
            </main>
        </div>
    );
};

export default App;