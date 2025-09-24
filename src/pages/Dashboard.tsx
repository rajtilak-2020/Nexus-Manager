import React from 'react';
import { useBlogs } from '../hooks/useBlogs';
import { useAuth } from '../contexts/AuthContext';
import {
  DocumentTextIcon,
  EyeIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { blogs, loading } = useBlogs();

  const stats = React.useMemo(() => {
    const published = blogs.filter(blog => blog.status === 'published').length;
    const drafts = blogs.filter(blog => blog.status === 'draft').length;
    const totalViews = blogs.reduce((acc, blog) => acc + (blog.reading_time || 0), 0);

    return [
      {
        name: 'Total Blogs',
        value: blogs.length,
        icon: DocumentTextIcon,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
      },
      {
        name: 'Published',
        value: published,
        icon: CheckCircleIcon,
        color: 'text-green-600',
        bg: 'bg-green-50',
      },
      {
        name: 'Drafts',
        value: drafts,
        icon: ClockIcon,
        color: 'text-yellow-600',
        bg: 'bg-yellow-50',
      },
      {
        name: 'Total Read Time',
        value: `${totalViews} min`,
        icon: EyeIcon,
        color: 'text-purple-600',
        bg: 'bg-purple-50',
      },
    ];
  }, [blogs]);

  const recentBlogs = blogs.slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here's an overview of your blog content management.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex items-center">
              <div className={`${stat.bg} rounded-lg p-3`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Blogs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent Blogs</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {recentBlogs.length > 0 ? (
            recentBlogs.map((blog) => (
              <div key={blog.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">
                      {blog.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {blog.summary}
                    </p>
                  </div>
                  <div className="ml-4 flex items-center space-x-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        blog.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : blog.status === 'draft'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {blog.status}
                    </span>
                    <span className="text-sm text-gray-500">
                      {blog.reading_time} min read
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-center">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No blogs yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first blog post.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;