import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, FileText, CheckSquare, Users, Shield, 
  FileCheck, AlertTriangle, BarChart3, Boxes, Settings,
  Menu, X, Sun, Moon, Search, Bell, ChevronDown, User, 
  LogOut, Settings as SettingsIcon, ScrollText, Repeat, Activity, Database
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useUser, Permission } from '../contexts/UserContext';
import { useAuth } from '../contexts/AuthProvider';
import { supabase } from '../lib/supabase';
import { RoleSwitcher } from './RoleSwitcher';
import { toast } from 'sonner';

interface AppShellProps {
  children: React.ReactNode;
}

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  permission?: Permission;
}

const navItems: NavItem[] = [
  { name: 'Home', path: '/', icon: LayoutDashboard, permission: 'view:dashboard' },
  { name: 'Requests', path: '/requests', icon: FileText, permission: 'view:my-requests' },
  { name: 'Approvals', path: '/approvals', icon: CheckSquare, permission: 'view:approvals' },
  { name: 'Identities', path: '/identities', icon: Users, permission: 'view:identities' },
  { name: 'Access', path: '/access/roles', icon: Shield, permission: 'view:roles' },
  { name: 'Reviews', path: '/reviews', icon: FileCheck, permission: 'view:reviews' },
  { name: 'JML', path: '/jml', icon: Activity, permission: 'view:jml' },
  { name: 'ISR Demo', path: '/isr-demo', icon: Database, permission: 'view:jml' },
  { name: 'Policies', path: '/policies', icon: ScrollText, permission: 'view:policies' },
  { name: 'Lifecycle', path: '/lifecycle', icon: Repeat, permission: 'view:lifecycle' },
  { name: 'Risk', path: '/risk', icon: AlertTriangle, permission: 'view:risk' },
  { name: 'Reports', path: '/reports', icon: BarChart3, permission: 'view:reports' },
  { name: 'Integrations', path: '/integrations', icon: Boxes, permission: 'view:integrations' },
  { name: 'Settings', path: '/settings', icon: Settings, permission: 'view:settings' },
];

export function AppShell({ children }: AppShellProps) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const { user, hasPermission } = useUser();
  const { session, profile } = useAuth();

  const displayName = React.useMemo(() => {
    return (
      profile?.full_name ||
      session?.user?.user_metadata?.full_name ||
      session?.user?.email ||
      user.name
    );
  }, [profile, session, user.name]);

  const subLabel = React.useMemo(() => {
    return (
      profile?.email ||
      session?.user?.email ||
      user.department || ''
    );
  }, [profile, session, user.department]);

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  // Filter navigation items based on user permissions
  const visibleNavItems = navItems.filter(item => {
    if (!item.permission) return true;
    return hasPermission(item.permission);
  });

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-[264px] border-r" style={{ 
        backgroundColor: 'var(--sidebar)',
        borderColor: 'var(--border)'
      }}>
        {/* Enhanced Logo */}
        <div className="h-18 flex items-center px-6 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md transition-all duration-200 hover:scale-105" style={{ 
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
            }}>
              <Shield className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <span className="font-bold tracking-tight block" style={{ 
                fontSize: 'var(--text-lg)',
                color: 'var(--text)',
                lineHeight: '1.2'
              }}>IAM Platform</span>
              <span className="text-xs font-medium" style={{ 
                color: 'var(--muted-foreground)',
                letterSpacing: '0.05em'
              }}>Identity Governance</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className="group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ease-out relative"
                style={{
                  backgroundColor: active ? 'var(--primary)' : 'transparent',
                  color: active ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                  fontWeight: active ? 'var(--font-weight-semibold)' : 'var(--font-weight-medium)',
                  fontSize: 'var(--text-body)',
                  boxShadow: active ? 'var(--shadow-md)' : 'none',
                  border: active ? '1px solid var(--primary)' : '1px solid transparent'
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'var(--accent)';
                    e.currentTarget.style.color = 'var(--accent-foreground)';
                    e.currentTarget.style.transform = 'translateX(2px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--muted-foreground)';
                    e.currentTarget.style.transform = 'translateX(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                <Icon className="w-[20px] h-[20px] flex-shrink-0 transition-all duration-200" strokeWidth={active ? 2.5 : 2} />
                <span className="truncate">{item.name}</span>
                {active && (
                  <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white opacity-80"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors duration-150" 
                style={{ backgroundColor: 'var(--accent)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--surface)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--accent)';
                }}
              >
                <Avatar className="w-9 h-9 ring-2 ring-border">
                  <AvatarFallback style={{ 
                    background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                    color: 'white',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-semibold)'
                  }}>
                    {displayName.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="truncate" style={{ 
                    fontSize: 'var(--text-body)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--text)'
                  }}>{displayName}</div>
                  <div className="truncate" style={{ 
                    fontSize: 'var(--text-sm)',
                    color: 'var(--muted-foreground)'
                  }}>{subLabel}</div>
                </div>
                <ChevronDown className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end"
              side="top"
              style={{ 
                width: '240px',
                backgroundColor: 'var(--popover)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                padding: '8px',
                boxShadow: 'var(--shadow-lg)',
                marginBottom: '8px'
              }}
            >
              <DropdownMenuLabel style={{ 
                fontSize: '11px',
                color: 'var(--muted-foreground)',
                textTransform: 'uppercase',
                fontWeight: '600',
                letterSpacing: '0.05em',
                padding: '8px 12px 4px'
              }}>
                Account
              </DropdownMenuLabel>
              <DropdownMenuSeparator style={{ 
                backgroundColor: 'var(--border)',
                margin: '8px 0'
              }} />
              
              <DropdownMenuItem
                onClick={() => {
                  toast.info("Profile view coming soon!", {
                    description: "User profile management will be available in a future update."
                  });
                }}
                style={{
                  padding: '10px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '4px',
                  backgroundColor: 'transparent',
                }}
              >
                <User className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text)' }}>View Profile</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  toast.info("Settings opened!", {
                    description: "Redirecting to account settings..."
                  });
                }}
                style={{
                  padding: '10px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '4px',
                  backgroundColor: 'transparent',
                }}
              >
                <SettingsIcon className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text)' }}>Account Settings</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator style={{ 
                backgroundColor: 'var(--border)',
                margin: '8px 0'
              }} />

              <DropdownMenuItem
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.href = '/auth';
                }}
                style={{
                  padding: '10px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  backgroundColor: 'transparent',
                }}
              >
                <LogOut className="w-4 h-4" style={{ color: 'var(--destructive)' }} />
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--destructive)' }}>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-[280px] flex flex-col" style={{ 
            backgroundColor: 'var(--bg)',
            boxShadow: 'var(--shadow-md)'
          }}>
            {/* Logo */}
            <div className="h-16 flex items-center justify-between px-6 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--primary)' }}>
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold" style={{ 
                  fontSize: 'var(--text-h2)',
                  color: 'var(--text)'
                }}>IAM Platform</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors"
                    style={{
                      backgroundColor: active ? 'var(--primary)' : 'transparent',
                      color: active ? 'white' : 'var(--text)',
                    }}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 border-b flex items-center justify-between px-4 lg:px-8" style={{ 
          backgroundColor: 'var(--bg)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--shadow-xs)'
        }}>
          <div className="flex items-center gap-4 flex-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden -ml-2"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>

            {/* Search */}
            <div className="hidden md:flex items-center gap-2 flex-1 max-w-lg relative">
              <Search className="w-4 h-4 absolute left-3.5 pointer-events-none" style={{ color: 'var(--muted-foreground)' }} />
              <Input 
                placeholder="Search users, roles, apps..." 
                className="pl-10 pr-16 w-full h-10 rounded-lg border-0 shadow-sm transition-all duration-150 focus-visible:shadow-md"
                style={{ 
                  backgroundColor: 'var(--input-background)',
                  fontSize: 'var(--text-sm)'
                }}
              />
              <kbd 
                className="absolute right-3 pointer-events-none px-1.5 py-0.5 rounded border text-[10px] font-semibold"
                style={{ 
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--border)',
                  color: 'var(--muted-foreground)'
                }}
              >
                ⌘K
              </kbd>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Role Switcher - Demo */}
            <div className="hidden lg:block mr-1">
              <RoleSwitcher />
            </div>

            {/* Theme Toggle */}
            <Button 
              variant="ghost" 
              size="icon"
              className="h-9 w-9 rounded-lg transition-all duration-150 hover:scale-105"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
            </Button>

            {/* Notifications */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative h-9 w-9 rounded-lg transition-all duration-150 hover:scale-105"
            >
              <Bell className="w-[18px] h-[18px]" />
              <span 
                className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center rounded-full text-[10px] font-semibold shadow-sm"
                style={{ 
                  backgroundColor: 'var(--danger)',
                  color: 'white'
                }}
              >
                3
              </span>
            </Button>

            {/* Mobile User */}
            <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9">
              <Avatar className="w-7 h-7">
                <AvatarFallback style={{ 
                  background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                  color: 'white',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--font-weight-semibold)'
                }}>
                  {displayName.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto" style={{ backgroundColor: 'var(--bg)' }}>
          {children}
        </main>
      </div>
    </div>
  );
}