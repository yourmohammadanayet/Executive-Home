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
  ChevronDown 
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { userAccess, role, isAdmin, isMember, signOut, switchRoleMode } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
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

  return (
    <div className="min-h-screen bg-[#F5F8F7] font-sans text-[#173F3A] flex flex-col overflow-hidden">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-900/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex flex-1 h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className={clsx(
          "fixed inset-y-0 left-0 z-50 bg-white border-r border-[#D5E2DF] transition-all duration-300 ease-in-out lg:static lg:translate-x-0 flex flex-col shrink-0 shadow-xs",
          isCollapsed ? "w-16" : "w-[235px]",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>
          {/* Logo Section */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-[#D5E2DF]">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="h-8 w-8 rounded bg-[#23796F] text-white flex items-center justify-center font-extrabold text-sm shrink-0">
                EH
              </div>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#173F3A] truncate">
                    Executive Home
                  </span>
                  <span className="text-[10px] text-gray-500 truncate">Resident Management</span>
                </div>
              )}
            </div>

            {/* Collapse Toggle (Desktop) */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex p-1 text-gray-400 hover:text-[#23796F] rounded hover:bg-gray-100"
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Grouped Sidebar Navigation */}
          <nav className="p-3 space-y-5 flex-1 overflow-y-auto">
            {currentGroups.map((group) => (
              <div key={group.groupName} className="space-y-1">
                {!isCollapsed && (
                  <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                    {group.groupName}
                  </div>
                )}
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
                        "flex items-center px-3 py-2 text-xs font-semibold rounded-md transition-all group relative outline-none",
                        isActive
                          ? "bg-[#EBF3F2] text-[#173F3A] border-l-[3px] border-[#23796F] font-bold"
                          : "text-gray-600 hover:bg-[#F5F8F7] hover:text-[#23796F]"
                      )}
                    >
                      <item.icon className={clsx(
                        "w-4 h-4 shrink-0 transition-colors",
                        isCollapsed ? "mx-auto" : "mr-3",
                        isActive ? "text-[#23796F]" : "text-gray-500 group-hover:text-[#23796F]"
                      )} />

                      {!isCollapsed && (
                        <span className="truncate">{item.name}</span>
                      )}

                      {/* Tooltip in collapsed mode */}
                      {isCollapsed && (
                        <div className="absolute left-full ml-2 px-2.5 py-1 bg-gray-900 text-white text-[11px] font-medium rounded shadow-md opacity-0 group-hover:opacity-100 pointer-events-none z-50 whitespace-nowrap transition-opacity">
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
          <div className="p-3 border-t border-[#D5E2DF] bg-gray-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-full bg-[#173F3A] text-white flex items-center justify-center font-bold text-xs shrink-0 border border-[#23796F]">
                  {userAccess?.full_name?.charAt(0) || (isAdmin ? 'A' : 'M')}
                </div>
                {!isCollapsed && (
                  <div className="flex flex-col min-w-0 text-left">
                    <span className="text-xs font-bold text-[#173F3A] truncate">
                      {userAccess?.full_name || (isAdmin ? 'Mohammad Anayet' : 'Member User')}
                    </span>
                    <span className="text-[10px] font-semibold text-[#23796F] uppercase tracking-wider">
                      {role}
                    </span>
                  </div>
                )}
              </div>

              {!isCollapsed && (
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* Main Header & Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Navbar Header */}
          <header className="h-18 shrink-0 border-b border-[#D5E2DF] bg-white px-4 sm:px-8 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="p-2 text-[#173F3A] lg:hidden rounded-lg hover:bg-gray-100"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="flex flex-col">
                <div className="text-[11px] text-gray-400 font-medium tracking-tight">
                  {headerDetails.breadcrumb}
                </div>
                <h1 className="text-lg sm:text-xl font-semibold text-[#173F3A] leading-tight">
                  {headerDetails.title}
                </h1>
                <p className="text-[11px] text-gray-500 hidden sm:block">
                  {headerDetails.description}
                </p>
              </div>
            </div>

            {/* Header Right Actions & Profile Menu */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="p-2 text-gray-500 hover:text-[#23796F] hover:bg-[#F5F8F7] rounded-lg transition-colors relative"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal-600"></span>
              </button>

              <button
                type="button"
                className="p-2 text-gray-500 hover:text-[#23796F] hover:bg-[#F5F8F7] rounded-lg transition-colors hidden sm:block"
                title="Help & Support"
              >
                <HelpCircle className="w-4 h-4" />
              </button>

              <div className="h-6 w-px bg-gray-200 hidden sm:block" />

              {/* User Avatar Menu Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#F5F8F7] transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[#173F3A] text-white text-xs font-bold flex items-center justify-center">
                    {userAccess?.full_name?.charAt(0) || 'U'}
                  </div>
                  <span className="text-xs font-bold text-[#173F3A] hidden sm:inline">
                    {userAccess?.full_name || 'User'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500 hidden sm:inline" />
                </button>

                {userMenuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-[#D5E2DF] py-2 z-50 animate-in fade-in zoom-in duration-100"
                    onMouseLeave={() => setUserMenuOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs font-bold text-[#173F3A]">{userAccess?.full_name || 'Mohammad Anayet'}</p>
                      <p className="text-[11px] text-gray-500 font-mono mt-0.5">{userAccess?.email || 'admin@exechome.com'}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-teal-50 text-[#23796F] text-[10px] font-bold rounded uppercase">
                        Role: {role}
                      </span>
                    </div>

                    <div className="py-1 text-xs">
                      {isMember && (
                        <Link
                          to="/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-[#F5F8F7] hover:text-[#23796F]"
                        >
                          <User className="w-4 h-4" /> My Profile
                        </Link>
                      )}

                      {isAdmin && (
                        <Link
                          to="/settings"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-[#F5F8F7] hover:text-[#23796F]"
                        >
                          <Settings className="w-4 h-4" /> Application Settings
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 font-semibold"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Main Outlet */}
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
