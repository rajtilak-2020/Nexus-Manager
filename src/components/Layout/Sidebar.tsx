import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  DocumentTextIcon,
  TagIcon,
  PhotoIcon,
  KeyIcon,
  UserIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Blogs', href: '/blogs', icon: DocumentTextIcon },
  { name: 'Media Library', href: '/media', icon: PhotoIcon },
  { name: 'Tags', href: '/tags', icon: TagIcon },
  { name: 'API Keys', href: '/api-keys', icon: KeyIcon },
  { name: 'Profile', href: '/profile', icon: UserIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

const Sidebar: React.FC = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="flex h-full flex-col bg-white shadow-lg">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b border-gray-200 px-6">
        <h1 className="text-xl font-bold text-gray-900">BlogCMS</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-6">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <item.icon
              className="mr-3 h-5 w-5 flex-shrink-0"
              aria-hidden="true"
            />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* User info */}
      <div className="border-t border-gray-200 px-4 py-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
              {user?.name.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="mt-3 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          Sign out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;