import { 
  FiHome, FiUsers, FiMail, FiCalendar, FiClock, FiSettings, 
  FiBarChart, FiLogOut, FiX, FiFileText, FiBell 
} from 'react-icons/fi';
import { Link, useLocation } from 'react-router-dom';

export default function Sidebar({ collapsed, mobileOpen, setMobileOpen, onLogout }) {
  const location = useLocation();
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FiHome, color: 'text-indigo-600', path: '/dashboard' },
    { id: 'analytics', label: 'Analytics', icon: FiBarChart, color: 'text-emerald-600', path: '/analytics' },
    { id: 'requests', label: 'Meeting Requests', icon: FiCalendar, color: 'text-violet-600', path: '/requests' },
    { id: 'meetings', label: 'Meeting Slots', icon: FiClock, color: 'text-amber-600', path: '/meetings' },
    { id: 'results', label: 'Meeting Results', icon: FiFileText, color: 'text-blue-600', path: '/results' },
    { id: 'demos', label: 'Demo Requests', icon: FiUsers, color: 'text-cyan-600', path: '/demos' },
    { id: 'newsletters', label: 'Newsletter', icon: FiMail, color: 'text-rose-600', path: '/newsletters' },
    { id: 'settings', label: 'Settings', icon: FiSettings, color: 'text-slate-600', path: '/settings' }
  ];



  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:sticky lg:top-0 inset-y-0 left-0 z-50 
        bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 
        shadow-2xl transition-all duration-300 
        ${collapsed ? 'w-20' : 'w-72'} 
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col h-screen lg:h-screen
      `}>
        {/* Header */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center justify-center">
            {!collapsed && (
              <div className="flex items-center gap-3">
                {/* FlowtelAI Logo */}
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">F</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                    FlowtelAI
                  </h2>
                  <p className="text-xs text-slate-400">Admin Panel</p>
                </div>
              </div>
            )}
            {collapsed && (
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">F</span>
              </div>
            )}
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-700 transition-colors text-slate-400 hover:text-white"
            >
              <FiX />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.id}>
                  <Link
                    to={item.path}
                    onClick={() => setMobileOpen && setMobileOpen(false)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg'
                        : 'hover:bg-slate-700 text-slate-300 hover:text-white'
                    }`}
                    title={collapsed ? item.label : ''}
                  >
                    <item.icon className={`${isActive ? 'text-white' : item.color} ${collapsed ? 'text-2xl' : 'text-xl'}`} />
                    {!collapsed && (
                      <span className="font-medium">{item.label}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors"
            title={collapsed ? 'Logout' : ''}
          >
            <FiLogOut className="text-xl" />
            {!collapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </div>
    </>
  );
}