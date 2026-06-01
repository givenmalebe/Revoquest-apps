import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Bell, 
  Menu, 
  X, 
  Search, 
  Settings, 
  LogOut, 
  User,
  BookOpen,
  GraduationCap,
  Users,
  BarChart3,
  MessageCircle,
  Trophy,
  Award,
  FileText,
  Calendar,
  Home,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import firebaseApiService from "@/services/firebaseApi";
import { NotificationBell } from './NotificationBell';
import UserProfile from './UserProfile';
import UserAvatar from './UserAvatar';
import revoquestLogo from "@/assets/revoquest-logo.png";

interface SmartLMSLayoutProps {
  children: React.ReactNode;
}

export const SmartLMSLayout = ({ children }: SmartLMSLayoutProps) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Users className="w-5 h-5" />;
      case 'instructor': return <GraduationCap className="w-5 h-5" />;
      case 'learner': return <User className="w-5 h-5" />;
      default: return <User className="w-5 h-5" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'instructor': return 'bg-blue-100 text-blue-800';
      case 'learner': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getNavigationItems = (role: string) => {
    const baseItems = [
      { name: 'Dashboard', href: '/dashboard', icon: Home },
    ];

    switch (role) {
      case 'admin':
        return [
          ...baseItems,
          { name: 'User Management', href: '/admin/users', icon: Users },
          { name: 'Course Management', href: '/admin/courses', icon: BookOpen },
          { name: 'Compliance Reports', href: '/admin/compliance', icon: FileText },
          { name: 'System Analytics', href: '/admin/analytics', icon: BarChart3 },
          { name: 'Certificates', href: '/admin/certificates', icon: Award },
          { name: 'Settings', href: '/admin/settings', icon: Settings },
        ];
      case 'instructor':
        return [
          ...baseItems,
          { name: 'My Courses', href: '/instructor/courses', icon: BookOpen },
          { name: 'Learners', href: '/instructor/learners', icon: Users },
          { name: 'Assessments', href: '/instructor/assessments', icon: FileText },
          { name: 'Analytics', href: '/instructor/analytics', icon: BarChart3 },
          { name: 'Calendar', href: '/instructor/calendar', icon: Calendar },
          { name: 'Settings', href: '/instructor/settings', icon: Settings },
        ];
      case 'learner':
        return [
          ...baseItems,
          { name: 'My Courses', href: '/learner/courses', icon: BookOpen },
          { name: 'Progress', href: '/learner/progress', icon: BarChart3 },
          { name: 'Certificates', href: '/learner/certificates', icon: Award },
          { name: 'AI Tutor', href: '/ai-tutor', icon: MessageCircle },
          { name: 'Calendar', href: '/learner/calendar', icon: Calendar },
        ];
      default:
        return baseItems;
    }
  };

  const navItems = getNavigationItems(user?.role || 'learner');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Hidden for all roles */}
      {false && (
        <div className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center">
              <img 
                src={revoquestLogo} 
                alt="SmartLMS Logo" 
                className="w-20 h-20 object-contain"
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <nav className="mt-6 px-3">
            <div className="space-y-1">
              {navItems.map((item) => {
                const isActive = window.location.pathname.includes(item.href.split('/')[1]);
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      isActive
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <item.icon className={cn(
                      "mr-3 h-5 w-5 flex-shrink-0",
                      isActive ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500"
                    )} />
                    {item.name}
                  </a>
                );
              })}
            </div>
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className={cn("text-xs", getRoleColor(user?.role || 'learner'))}>
                    {getRoleIcon(user?.role || 'learner')}
                    <span className="ml-1 capitalize">{user?.role}</span>
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="">
        {/* Top navigation */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {navItems.find(item => window.location.pathname.includes(item.href.split('/')[1]))?.name || 'Dashboard'}
              </h2>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="hidden md:block relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses, learners..."
                  className="pl-10 pr-4 py-2 w-64 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Notifications */}
              <NotificationBell />

              {/* User menu */}
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setProfileOpen(true)}
                  className="flex items-center space-x-2 p-2"
                >
                  <UserAvatar user={user} size="md" />
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleLogout}
                  className="ml-2"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>

      {/* User Profile Modal */}
      {profileOpen && (
        <UserProfile 
          isModal={true} 
          onClose={() => setProfileOpen(false)} 
        />
      )}
    </div>
  );
};