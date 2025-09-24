import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Blog } from '../../lib/supabase';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface BlogEditorProps {
  blog?: Blog;
  onSave: (data: Partial<Blog>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

interface BlogFormData {
  title: string;
  summary: string;
  content: string;
  status: 'draft' | 'published' | 'inactive';
  seo_title: string;
  seo_description: string;
  featured_image_url: string;
}

const BlogEditor: React.FC<BlogEditorProps> = ({
  blog,
  onSave,
  onCancel,
  loading = false,
}) => {
  const [content, setContent] = useState(blog?.content || '');
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<BlogFormData>({
    defaultValues: {
      title: blog?.title || '',
      summary: blog?.summary || '',
      content: blog?.content || '',
      status: blog?.status || 'draft',
      seo_title: blog?.seo_title || '',
      seo_description: blog?.seo_description || '',
      featured_image_url: blog?.featured_image_url || '',
    },
  });

  const watchedTitle = watch('title');

  useEffect(() => {
    setValue('content', content);
  }, [content, setValue]);

  useEffect(() => {
    if (watchedTitle && !watch('seo_title')) {
      setValue('seo_title', watchedTitle);
    }
  }, [watchedTitle, setValue, watch]);

  const onSubmit = async (data: BlogFormData) => {
    await onSave({ ...data, content });
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      ['clean'],
    ],
  };

  return (
    <div className="fixed inset-0 z-50 bg-white">
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-900">
            {blog ? 'Edit Blog' : 'Create New Blog'}
          </h1>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col">
          {/* Content */}
          <div className="flex flex-1 overflow-hidden">
            {/* Left Panel - Form */}
            <div className="w-1/3 flex-shrink-0 border-r border-gray-200 p-6 overflow-y-auto">
              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Basic Information
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title
                      </label>
                      <input
                        {...register('title', { required: 'Title is required' })}
                        type="text"
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Enter blog title"
                      />
                      {errors.title && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.title.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Summary
                      </label>
                      <textarea
                        {...register('summary')}
                        rows={3}
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Brief summary of the blog post"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Featured Image URL
                      </label>
                      <input
                        {...register('featured_image_url')}
                        type="url"
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        {...register('status')}
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* SEO Settings */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    SEO Settings
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        SEO Title
                      </label>
                      <input
                        {...register('seo_title')}
                        type="text"
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="SEO optimized title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        SEO Description
                      </label>
                      <textarea
                        {...register('seo_description')}
                        rows={2}
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Meta description for search engines"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel - Editor/Preview */}
            <div className="flex-1 flex flex-col">
              {/* Tab Navigation */}
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  <button
                    type="button"
                    onClick={() => setActiveTab('editor')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'editor'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Editor
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('preview')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'preview'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Preview
                  </button>
                </nav>
              </div>

              {/* Editor/Preview Content */}
              <div className="flex-1 overflow-hidden">
                {activeTab === 'editor' ? (
                  <div className="h-full">
                    <ReactQuill
                      theme="snow"
                      value={content}
                      onChange={setContent}
                      modules={modules}
                      className="h-full [&_.ql-container]:h-[calc(100%-42px)] [&_.ql-editor]:min-h-full"
                      placeholder="Start writing your blog content..."
                    />
                  </div>
                ) : (
                  <div className="p-6 prose prose-lg max-w-none overflow-y-auto h-full">
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : blog ? 'Update Blog' : 'Create Blog'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlogEditor;