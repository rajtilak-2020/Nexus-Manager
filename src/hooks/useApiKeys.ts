import { useState, useEffect } from 'react';
import { supabase, ApiKey } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export const useApiKeys = () => {
  const { user } = useAuth();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApiKeys = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_api_keys')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        toast.error('Error fetching API keys');
        return;
      }

      setApiKeys(data);
    } catch (error) {
      toast.error('Error fetching API keys');
    } finally {
      setLoading(false);
    }
  };

  const createApiKey = async (name: string) => {
    if (!user) return { error: 'No user logged in' };

    try {
      const { data, error } = await supabase
        .from('user_api_keys')
        .insert([
          {
            user_id: user.id,
            name,
          },
        ])
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      toast.success('API key created successfully');
      await fetchApiKeys();
      return { data };
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  };

  const deleteApiKey = async (id: string) => {
    if (!user) return { error: 'No user logged in' };

    try {
      const { error } = await supabase
        .from('user_api_keys')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        return { error: error.message };
      }

      toast.success('API key deleted successfully');
      await fetchApiKeys();
      return {};
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  };

  const toggleApiKey = async (id: string, isActive: boolean) => {
    if (!user) return { error: 'No user logged in' };

    try {
      const { error } = await supabase
        .from('user_api_keys')
        .update({ is_active: isActive })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        return { error: error.message };
      }

      toast.success(`API key ${isActive ? 'activated' : 'deactivated'} successfully`);
      await fetchApiKeys();
      return {};
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  };

  useEffect(() => {
    if (user) {
      fetchApiKeys();
    }
  }, [user]);

  return {
    apiKeys,
    loading,
    fetchApiKeys,
    createApiKey,
    deleteApiKey,
    toggleApiKey,
  };
};