import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  DoorClosed, 
  Receipt, 
  History, 
  FileText, 
  BarChart, 
  Settings, 
  ShieldCheck, 
  Clock, 
  User, 
  LogOut, 
  Menu, 
  ChevronLeft, 
  ChevronRight, 
  Bell, 
  HelpCircle, 
  ChevronDown,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { userAccess, role, isAdmin, isMember, signOut, switchRoleMode } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    setShowLogoutModal(false);
    navigate('/login');
  };

  const toggleSidebarCollapse = () => {
    const newValue = !isCollapsed;
    setIsCollapsed(newValue);
    localStorage.setItem('sidebar_collapsed', String(newValue));
  };

  // Grouped Navigation for Admin
  const ADMIN_GROUPS = [
    {
      groupName: 'OVERVIEW',
      items: [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
      ]
    },
    {
      groupName: 'MANAGEMENT',
      items: [
        { name: 'Members', href: '/members', icon: Users },
        { name: 'Rooms', href: '/rooms', icon: DoorClosed },
        { name: 'Monthly Payments', href: '/payments', icon: Receipt },
        { name: 'Payment History', href: '/history', icon: History },
        { name: 'Documents', href: '/documents', icon: FileText },
      ]
    },
    {
      groupName: 'INSIGHTS',
      items: [
        { name: 'Reports', href: '/reports', icon: BarChart },
      ]
    },
    {
      groupName: 'ADMINISTRATION',
      items: [
        { name: 'User Access', href: '/user-access', icon: ShieldCheck },
        { name: 'Settings', href: '/settings', icon: Settings },
        { name: 'Activity Logs', href: '/activity-logs', icon: Clock },
      ]
    }
  ];

  // Grouped Navigation for Member
  const MEMBER_GROUPS = [
    {
      groupName: 'OVERVIEW',
      items: [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
      ]
    },
    {
      groupName: 'MY ACCOUNT',
      items: [
        { name: 'My Profile', href: '/profile', icon: User },
        { name: 'My Payments', href: '/payments', icon: Receipt },
        { name: 'My Receipts', href: '/history', icon: History },
      ]
    }
  ];

  const currentGroups = isAdmin ? ADMIN_GROUPS : MEMBER_GROUPS;

  // Derive Page Header Details
  const getHeaderDetails = () => {
    const path = location.pathname;
    const search = location.search;

    if (path === '/') {
      return {
        breadcrumb: 'Home / Overview / Dashboard',
        title: 'Executive Home Dashboard',
        description: 'Real-time overview of monthly rent collections, seats, and member statuses.'
      };
    }
    if (path === '/members') {
      return {
        breadcrumb: 'Home / Management / Members',
        title: 'Member Directory',
        description: 'Manage resident profiles, assigned rooms, and contact information.'
      };
    }
    if (path === '/rooms') {
      return {
        breadcrumb: 'Home / Management / Rooms',
        title: 'Room & Capacity Allocations',
        description: 'View room types, current occupants, and available bed spaces.'
      };
    }
    if (path === '/payments') {
      return {
        breadcrumb: 'Home / Management / Monthly Payments',
        title: 'Monthly Rent Ledger',
        description: 'Track monthly rent collections, joining charge balances, and payment statuses.'
      };
    }
    if (path === '/history') {
      return {
        breadcrumb: 'Home / Management / Payment History',
        title: 'Payment History & Receipts',
        description: 'View completed payment transactions and download official payment receipts.'
      };
    }
    if (path === '/documents') {
      return {
        breadcrumb: 'Home / Management / Documents',
        title: 'Resident Verification Documents',
        description: 'Verify resident National ID, passports, and tenancy agreements.'
      };
    }
    if (path === '/reports') {
      return {
        breadcrumb: 'Home / Insights / Reports',
        title: 'Financial & Occupancy Analytics',
        description: 'Comprehensive financial reporting, collection percentages, and revenue streams.'
      };
    }
    if (path === '/user-access') {
      return {
        breadcrumb: 'Home / Administration / User Access',
        title: 'User Access',
        description: 'Control who can sign in to Executive Home.'
      };
    }
    if (path === '/activity-logs') {
      return {
        breadcrumb: 'Home / Administration / Activity Logs',
        title: 'Activity Logs',
        description: 'Audit history of administrative actions, user access changes, and logins.'
      };
    }
    if (path === '/settings') {
      return {
        breadcrumb: 'Home / Administration / Settings',
        title: 'Application Settings',
        description: 'Manage application preferences, member access and security.'
      };
    }
    if (path === '/profile') {
      return {
        breadcrumb: 'Home / My Account / My Profile',
        title: 'My Member Profile',
        description: 'View your profile details, room allocation, and submit profile update requests.'
      };
    }
    return {
      breadcrumb: 'Home / Executive Home',
      title: 'Executive Home',
      description: 'Hostel and resident management workspace.'
    };
  };

  const headerDetails = getHeaderDetails();

  const getBadge = (name: string) => {
    if (name === 'Monthly Payments' || name === 'My Payments') {
      return (
        <span className="ml-auto inline-flex items-center justify-center px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider rounded bg-red-100 text-red-700 border border-red-200 dark:border-red-800 animate-pulse shrink-0">
          3 Due
        </span>
      );
    }
    if (name === 'Documents') {
      return (
        <span className="ml-auto flex h-2 w-2 relative shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
      );
    }
    return null;
  };

  return (
    <div className="h-screen w-screen bg-[#F5F8F7] dark:bg-dark-canvas font-sans text-[#173F3A] dark:text-dark-text-primary flex flex-col overflow-hidden transition-colors duration-200">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-900/60 lg:hidden backdrop-blur-xs"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex flex-1 h-full overflow-hidden">
        {/* Sidebar */}
        <aside className={clsx(
          "fixed inset-y-0 left-0 z-50 h-screen lg:h-full bg-white dark:bg-dark-surface dark:bg-dark-canvas border-r border-[#D5E2DF] dark:border-dark-border dark:border-dark-divider transition-all duration-300 ease-in-out lg:static lg:translate-x-0 flex flex-col shrink-0 shadow-xs overflow-hidden",
          isCollapsed ? "lg:w-16 w-[245px]" : "w-[245px]",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>
          {/* Logo Section */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-[#D5E2DF] dark:border-dark-border dark:border-dark-divider shrink-0">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="h-8 w-8 rounded-lg bg-[#23796F] text-white flex items-center justify-center font-extrabold text-sm shrink-0 shadow-xs">
                EH
              </div>
              <div className={clsx("flex flex-col min-w-0 transition-all duration-300", isCollapsed ? "lg:opacity-0 lg:w-0 lg:h-0 overflow-hidden" : "opacity-100")}>
                <span className="text-xs font-bold uppercase tracking-wider text-[#173F3A] dark:text-dark-text-primary truncate leading-none">
                  Executive Home
                </span>
                <span className="text-[10px] text-gray-500 dark:text-dark-text-secondary truncate mt-1">Resident Management</span>
              </div>
            </div>

            {/* Collapse Toggle (Desktop) */}
            <button
              onClick={toggleSidebarCollapse}
              className="hidden lg:flex p-1.5 text-gray-400 dark:text-dark-text-muted hover:text-[#23796F] dark:hover:text-dark-teal dark:text-dark-teal rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover dark:bg-dark-raised transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Grouped Sidebar Navigation */}
          <nav className="p-3 space-y-5 flex-1 overflow-y-auto scrollbar-thin">
            {currentGroups.map((group) => (
              <div key={group.groupName} className="space-y-1">
                <div className={clsx("px-3 text-[12px] font-bold uppercase tracking-wider text-gray-400 dark:text-dark-text-muted mb-1 transition-all duration-300", isCollapsed ? "lg:opacity-0 lg:h-0 overflow-hidden" : "opacity-100")}>
                  {group.groupName}
                </div>
                {group.items.map((item) => {
                  const isActive = 
                    location.pathname === item.href || 
                    (item.href !== '/' && location.pathname + location.search === item.href);

                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      title={isCollapsed ? item.name : undefined}
                      className={clsx(
                        "flex items-center px-3 py-2.5 text-[14px] font-medium rounded-lg transition-all duration-200 group relative outline-none",
                        isActive
                          ? "text-[#173F3A] dark:text-dark-text-primary dark:text-dark-teal font-bold"
                          : "text-gray-600 dark:text-dark-text-secondary hover:bg-[#F5F8F7] dark:hover:bg-dark-hover dark:bg-dark-canvas dark:hover:bg-dark-hover dark:bg-dark-canvas/50 dark:hover:bg-dark-hover hover:text-[#23796F] dark:hover:text-dark-teal dark:text-dark-teal dark:hover:text-dark-teal dark:text-dark-teal dark:hover:text-dark-teal"
                      )}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeTabBackground"
                          className="absolute inset-0 bg-[#EBF3F2] dark:bg-dark-teal/10 border-l-[3.5px] border-[#23796F] dark:border-emerald-500 z-0 rounded-lg"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                      
                      <div className="relative z-10 flex items-center justify-between w-full min-w-0">
                        <div className="flex items-center min-w-0 w-full">
                          <div className="relative flex items-center shrink-0">
                            <item.icon className={clsx(
                              "w-4 h-4 shrink-0 transition-colors",
                              isCollapsed ? "lg:mx-auto" : "mr-3",
                              isActive ? "text-[#23796F] dark:text-dark-teal" : "text-gray-500 dark:text-dark-text-secondary group-hover:text-[#23796F] dark:hover:text-dark-teal dark:text-dark-teal dark:hover:text-dark-teal dark:text-dark-teal"
                            )} />
                            {isCollapsed && (item.name === 'Monthly Payments' || item.name === 'My Payments') && (
                              <span className="absolute -top-1 -right-1 flex h-1.5 w-1.5 lg:flex hidden">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                              </span>
                            )}
                            {isCollapsed && item.name === 'Documents' && (
                              <span className="absolute -top-1 -right-1 flex h-1.5 w-1.5 lg:flex hidden">
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                              </span>
                            )}
                          </div>

                          <span className={clsx("truncate transition-all duration-300", isCollapsed ? "lg:opacity-0 lg:w-0 overflow-hidden lg:ml-0 ml-3" : "ml-3")}>
                            {item.name}
                          </span>
                        </div>

                        <div className={clsx("transition-all duration-300", isCollapsed ? "lg:opacity-0 lg:w-0 overflow-hidden" : "opacity-100")}>
                          {getBadge(item.name)}
                        </div>
                      </div>

                      {/* Tooltip in collapsed mode */}
                      {isCollapsed && (
                        <div className="absolute left-full ml-2 px-2.5 py-1 bg-gray-900 text-white text-[11px] font-medium rounded shadow-md opacity-0 lg:group-hover:opacity-100 pointer-events-none z-50 whitespace-nowrap transition-opacity hidden lg:block">
                          {item.name}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Sidebar Footer User Section */}
          <div className="p-4 border-t border-[#D5E2DF] dark:border-dark-border dark:border-dark-divider bg-gray-50/50 dark:bg-dark-surface/30 transition-colors shrink-0">
            {/* Expanded Footer (Visible when not collapsed, OR always on mobile) */}
            <div className={clsx("flex flex-col gap-3 w-full", isCollapsed ? "flex lg:hidden" : "flex")}>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-full bg-[#173F3A] text-white flex items-center justify-center font-bold text-sm shrink-0 border-2 border-[#23796F] dark:border-emerald-500 shadow-xs">
                  {userAccess?.full_name?.charAt(0) || (isAdmin ? 'A' : 'M')}
                </div>
                <div className="flex flex-col min-w-0 text-left">
                  <span className="text-[14px] font-bold text-[#173F3A] dark:text-dark-text-primary truncate leading-tight">
                    {userAccess?.full_name || (isAdmin ? 'Mohammad Anayet' : 'Member User')}
                  </span>
                  <span className="text-[12px] font-semibold text-[#23796F] dark:text-dark-teal uppercase tracking-wider mt-0.5">
                    {role}
                  </span>
                </div>
              </div>
              
              {/* Upgraded Full-width Logout Button */}
              <button
                onClick={() => setShowLogoutModal(true)}
                className="w-full h-11 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-gray-600 dark:text-dark-text-secondary hover:text-red-600 dark:text-dark-red dark:hover:text-red-400 bg-white dark:bg-dark-surface dark:bg-dark-canvas hover:bg-red-50/50 dark:hover:bg-red-900/20 border border-gray-200 dark:border-dark-border hover:border-red-200 dark:border-red-800 dark:hover:border-red-800 rounded-xl transition-all shadow-2xs cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>Log Out</span>
              </button>
            </div>

            {/* Collapsed Footer (Visible ONLY when collapsed, AND on desktop) */}
            <div className={clsx("flex-col items-center gap-4", isCollapsed ? "hidden lg:flex" : "hidden")}>
              <div 
                className="w-10 h-10 rounded-full bg-[#173F3A] text-white flex items-center justify-center font-bold text-sm shrink-0 border-2 border-[#23796F] dark:border-emerald-500 shadow-xs cursor-help relative group/profile"
              >
                {userAccess?.full_name?.charAt(0) || (isAdmin ? 'A' : 'M')}
                <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-[11px] font-medium rounded shadow-md opacity-0 group-hover/profile:opacity-100 pointer-events-none z-50 whitespace-nowrap transition-opacity">
                  <div className="font-bold">{userAccess?.full_name || 'Mohammad Anayet'}</div>
                  <div className="text-[9px] text-gray-300 capitalize">{role}</div>
                </div>
              </div>

              <button
                onClick={() => setShowLogoutModal(true)}
                className="p-2.5 text-gray-500 dark:text-dark-text-secondary hover:text-red-600 dark:text-dark-red hover:bg-red-50 dark:hover:bg-red-900/30 dark:bg-dark-red/10 rounded-lg transition-colors cursor-pointer group relative outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
                <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-[11px] font-medium rounded shadow-md opacity-0 group-hover:opacity-100 pointer-events-none z-50 whitespace-nowrap transition-opacity">
                  Log Out
                </div>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Header & Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Navbar Header */}
          <header className="h-18 shrink-0 border-b border-[#D5E2DF] dark:border-dark-border dark:border-dark-divider bg-white dark:bg-dark-surface dark:bg-dark-canvas px-4 sm:px-8 flex items-center justify-between shadow-2xs transition-colors duration-200">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="p-2 text-[#173F3A] dark:text-dark-text-primary lg:hidden rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover dark:bg-dark-raised outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="flex flex-col">
                <h1 className="text-xl sm:text-2xl font-bold text-[#173F3A] dark:text-dark-text-primary leading-tight">
                  {headerDetails.title}
                </h1>
                <p className="text-[13px] text-gray-500 dark:text-dark-text-secondary hidden sm:block mt-0.5">
                  {headerDetails.description}
                </p>
              </div>
            </div>

            {/* Header Right Actions & Profile Menu */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle Menu */}
              <div className="relative">
                <button
                  onClick={() => setThemeMenuOpen(!themeMenuOpen)}
                  className="p-2 text-gray-500 dark:text-dark-text-muted hover:text-[#23796F] dark:hover:text-dark-teal rounded-full hover:bg-gray-100 dark:hover:bg-dark-raised transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal"
                  title="Theme preferences"
                >
                  {resolvedTheme === 'light' ? (
                    <Sun className="w-5 h-5" />
                  ) : (
                    <Moon className="w-5 h-5" />
                  )}
                </button>
                
                {themeMenuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-36 bg-white dark:bg-dark-surface rounded-xl shadow-xl border border-[#D5E2DF] dark:border-dark-border py-2 z-50 animate-in fade-in zoom-in duration-100"
                    onMouseLeave={() => setThemeMenuOpen(false)}
                  >
                    <button
                      onClick={() => { setTheme('light'); setThemeMenuOpen(false); }}
                      className={`w-full text-left flex items-center gap-2 px-4 py-2 text-[14px] font-medium hover:bg-[#F5F8F7] dark:hover:bg-dark-hover ${theme === 'light' ? 'text-[#23796F] dark:text-dark-teal' : 'text-gray-700 dark:text-dark-text-secondary'}`}
                    >
                      <Sun className="w-4 h-4" /> Light
                    </button>
                    <button
                      onClick={() => { setTheme('dark'); setThemeMenuOpen(false); }}
                      className={`w-full text-left flex items-center gap-2 px-4 py-2 text-[14px] font-medium hover:bg-[#F5F8F7] dark:hover:bg-dark-hover ${theme === 'dark' ? 'text-[#23796F] dark:text-dark-teal' : 'text-gray-700 dark:text-dark-text-secondary'}`}
                    >
                      <Moon className="w-4 h-4" /> Dark
                    </button>
                    <button
                      onClick={() => { setTheme('system'); setThemeMenuOpen(false); }}
                      className={`w-full text-left flex items-center gap-2 px-4 py-2 text-[14px] font-medium hover:bg-[#F5F8F7] dark:hover:bg-dark-hover ${theme === 'system' ? 'text-[#23796F] dark:text-dark-teal' : 'text-gray-700 dark:text-dark-text-secondary'}`}
                    >
                      <Monitor className="w-4 h-4" /> System
                    </button>
                  </div>
                )}
              </div>

              {/* User Avatar Menu Dropdown (Clean, minimal as requested) */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="w-8 h-8 rounded-full bg-[#173F3A] text-white text-xs font-bold flex items-center justify-center border border-teal-600 hover:scale-105 active:scale-95 transition-all duration-200 shadow-2xs"
                  title="Profile Menu"
                >
                  {userAccess?.full_name?.charAt(0) || 'U'}
                </button>

                {userMenuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-dark-surface rounded-xl shadow-xl border border-[#D5E2DF] dark:border-dark-border py-2 z-50 animate-in fade-in zoom-in duration-100"
                    onMouseLeave={() => setUserMenuOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-dark-border">
                      <p className="text-[14px] font-bold text-[#173F3A] dark:text-dark-text-primary">{userAccess?.full_name || 'Mohammad Anayet'}</p>
                      <p className="text-[13px] text-gray-500 dark:text-dark-text-secondary font-mono mt-0.5">{userAccess?.email || 'admin@exechome.com'}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-teal-50 dark:bg-dark-teal/10 dark:bg-dark-teal/20 text-[#23796F] dark:text-dark-teal text-[10px] font-bold rounded uppercase">
                        Role: {role}
                      </span>
                    </div>

                    <div className="py-1 text-xs">
                      {isMember && (
                        <Link
                          to="/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-dark-text-secondary hover:bg-[#F5F8F7] dark:hover:bg-dark-hover dark:bg-dark-canvas hover:text-[#23796F] dark:hover:text-dark-teal dark:text-dark-teal outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
                        >
                          <User className="w-4 h-4" /> My Profile
                        </Link>
                      )}

                      {isAdmin && (
                        <Link
                          to="/settings"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-dark-text-secondary hover:bg-[#F5F8F7] dark:hover:bg-dark-hover dark:bg-dark-canvas hover:text-[#23796F] dark:hover:text-dark-teal dark:text-dark-teal outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
                        >
                          <Settings className="w-4 h-4" /> Application Settings
                        </Link>
                      )}

                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          setShowLogoutModal(true);
                        }}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-red-600 dark:text-dark-red hover:bg-red-50 dark:hover:bg-red-900/30 dark:bg-dark-red/10 dark:hover:bg-red-900/20 font-semibold outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Main Outlet (Strictly isolated scrolling view) */}
          <main className="flex-1 overflow-y-auto min-w-0 bg-[#F5F8F7] dark:bg-dark-canvas transition-colors duration-200">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setShowLogoutModal(false)}
          />
          
          {/* Modal Content */}
          <div className="relative bg-white dark:bg-dark-surface rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-[#D5E2DF] dark:border-dark-border text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 dark:bg-dark-red/10 text-red-600 dark:text-dark-red mb-4 border border-red-100 dark:border-red-900/30 dark:border-red-800">
              <LogOut className="h-6 w-6" />
            </div>
            
            <h3 className="text-base font-bold text-[#173F3A] dark:text-dark-text-primary mb-1">
              Are you sure you want to log out?
            </h3>
            <p className="text-xs text-gray-500 dark:text-dark-text-secondary mb-6 px-2 leading-relaxed">
              You will need to sign in with your account credentials again to access the Executive Home workspace.
            </p>
            
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 px-4 text-xs font-bold text-gray-700 dark:text-dark-text-secondary bg-gray-100 dark:bg-dark-raised hover:bg-gray-200 dark:hover:bg-dark-hover rounded-xl transition-colors border border-transparent cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex-1 py-2.5 px-4 text-xs font-bold text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 rounded-xl transition-colors shadow-xs cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
