import { useState, useEffect } from 'react';
import { supabase, Blog, BlogTag } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import slugify from 'slugify';

export const useBlogs = () => {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  const calculateReadingTime = (content: string): number => {
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  };

  const generateSlug = (title: string): string => {
    return slugify(title, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g,
    });
  };

  const fetchBlogs = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('blogs')
        .select(`
          *,
          tags:blog_post_tags(
            tag:blog_tags(*)
          )
        `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        toast.error('Error fetching blogs');
        return;
      }

      const blogsWithTags = data.map(blog => ({
        ...blog,
        tags: blog.tags.map((t: any) => t.tag),
      }));

      setBlogs(blogsWithTags);
    } catch (error) {
      toast.error('Error fetching blogs');
    } finally {
      setLoading(false);
    }
  };

  const createBlog = async (blogData: Partial<Blog>) => {
    if (!user) return { error: 'No user logged in' };

    try {
      const slug = generateSlug(blogData.title || '');
      const readingTime = calculateReadingTime(blogData.content || '');

      const { data, error } = await supabase
        .from('blogs')
        .insert([
          {
            ...blogData,
            user_id: user.id,
            slug,
            reading_time: readingTime,
          },
        ])
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      toast.success('Blog created successfully');
      await fetchBlogs();
      return { data };
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  };

  const updateBlog = async (id: string, blogData: Partial<Blog>) => {
    if (!user) return { error: 'No user logged in' };

    try {
      const updates: any = { ...blogData };
      
      if (blogData.title) {
        updates.slug = generateSlug(blogData.title);
      }
      
      if (blogData.content) {
        updates.reading_time = calculateReadingTime(blogData.content);
      }

      if (blogData.status === 'published' && !blogData.published_at) {
        updates.published_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('blogs')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      toast.success('Blog updated successfully');
      await fetchBlogs();
      return { data };
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  };

  const deleteBlog = async (id: string) => {
    if (!user) return { error: 'No user logged in' };

    try {
      const { error } = await supabase
        .from('blogs')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        return { error: error.message };
      }

      toast.success('Blog deleted successfully');
      await fetchBlogs();
      return {};
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  };

  const publishBlog = async (id: string) => {
    return updateBlog(id, { 
      status: 'published', 
      published_at: new Date().toISOString() 
    });
  };

  const unpublishBlog = async (id: string) => {
    return updateBlog(id, { status: 'inactive' });
  };

  useEffect(() => {
    if (user) {
      fetchBlogs();
    }
  }, [user]);

  return {
    blogs,
    loading,
    fetchBlogs,
    createBlog,
    updateBlog,
    deleteBlog,
    publishBlog,
    unpublishBlog,
  };
};