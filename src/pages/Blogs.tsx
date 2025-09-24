import React, { useState } from 'react';
import { useBlogs } from '../hooks/useBlogs';
import BlogEditor from '../components/Blogs/BlogEditor';
import { Blog } from '../lib/supabase';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const Blogs: React.FC = () => {
  const { blogs, loading, createBlog, updateBlog, deleteBlog, publishBlog, unpublishBlog } = useBlogs();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | undefined>();
  const [filter, setFilter] = useState<'all' | 'published' | 'draft' | 'inactive'>('all');

  const filteredBlogs = blogs.filter(blog => {
    if (filter === 'all') return true;
    return blog.status === filter;
  });

  const handleCreateBlog = () => {
    setEditingBlog(undefined);
    setIsEditorOpen(true);
  };

  const handleEditBlog = (blog: Blog) => {
    setEditingBlog(blog);
    setIsEditorOpen(true);
  };

  const handleSaveBlog = async (blogData: Partial<Blog>) => {
    if (editingBlog) {
      await updateBlog(editingBlog.id, blogData);
    } else {
      await createBlog(blogData);
    }
    setIsEditorOpen(false);
  };

  const handleDeleteBlog = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      await deleteBlog(id);
    }
  };

  const handleToggleStatus = async (blog: Blog) => {
    if (blog.status === 'published') {
      await unpublishBlog(blog.id);
    } else {
      await publishBlog(blog.id);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blogs</h1>
          <p className="text-gray-600 mt-1">
            Manage your blog posts and content.
          </p>
        </div>
        <button
          onClick={handleCreateBlog}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          New Blog
        </button>
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        {(['all', 'published', 'draft', 'inactive'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-2 text-sm font-medium rounded-lg ${
              filter === status
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            {status !== 'all' && (
              <span className="ml-1 text-xs">
                ({blogs.filter(blog => blog.status === status).length})
              </span>
            )}
            {status === 'all' && (
              <span className="ml-1 text-xs">({blogs.length})</span>
            )}
          </button>
        ))}
      </div>

      {/* Blog List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {filteredBlogs.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredBlogs.map((blog) => (
              <div key={blog.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-medium text-gray-900">
                        {blog.title}
                      </h3>
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
                    </div>
                    
                    {blog.summary && (
                      <p className="text-gray-600 mt-1 line-clamp-2">
                        {blog.summary}
                      </p>
                    )}
                    
                    <div className="flex items-center space-x-6 mt-3 text-sm text-gray-500">
                      <span>
                        Updated {format(new Date(blog.updated_at), 'MMM d, yyyy')}
                      </span>
                      <span>{blog.reading_time} min read</span>
                      {blog.published_at && (
                        <span>
                          Published {format(new Date(blog.published_at), 'MMM d, yyyy')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleToggleStatus(blog)}
                      className={`p-2 text-sm font-medium rounded-lg ${
                        blog.status === 'published'
                          ? 'text-yellow-700 hover:bg-yellow-50'
                          : 'text-green-700 hover:bg-green-50'
                      }`}
                      title={blog.status === 'published' ? 'Unpublish' : 'Publish'}
                    >
                      {blog.status === 'published' ? (
                        <EyeSlashIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                    </button>
                    
                    <button
                      onClick={() => handleEditBlog(blog)}
                      className="p-2 text-blue-700 hover:bg-blue-50 rounded-lg"
                      title="Edit"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDeleteBlog(blog.id)}
                      className="p-2 text-red-700 hover:bg-red-50 rounded-lg"
                      title="Delete"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {filter !== 'all' ? filter : ''} blogs found
            </h3>
            <p className="text-gray-500 mb-6">
              {filter === 'all'
                ? "Get started by creating your first blog post."
                : `No blogs with status "${filter}" found.`}
            </p>
            {filter === 'all' && (
              <button
                onClick={handleCreateBlog}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Create your first blog
              </button>
            )}
          </div>
        )}
      </div>

      {/* Blog Editor Modal */}
      {isEditorOpen && (
        <BlogEditor
          blog={editingBlog}
          onSave={handleSaveBlog}
          onCancel={() => setIsEditorOpen(false)}
        />
      )}
    </div>
  );
};

export default Blogs;