import React, { useState } from 'react';
import { useApiKeys } from '../hooks/useApiKeys';
import {
  PlusIcon,
  ClipboardDocumentIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const ApiKeys: React.FC = () => {
  const { apiKeys, loading, createApiKey, deleteApiKey, toggleApiKey } = useApiKeys();
  const [newKeyName, setNewKeyName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    const { error } = await createApiKey(newKeyName.trim());
    if (!error) {
      setNewKeyName('');
      setShowCreateForm(false);
    }
  };

  const handleDeleteKey = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the API key "${name}"?`)) {
      await deleteApiKey(id);
    }
  };

  const handleToggleVisibility = (keyId: string) => {
    const newVisibleKeys = new Set(visibleKeys);
    if (newVisibleKeys.has(keyId)) {
      newVisibleKeys.delete(keyId);
    } else {
      newVisibleKeys.add(keyId);
    }
    setVisibleKeys(newVisibleKeys);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('API key copied to clipboard');
  };

  const maskKey = (key: string) => {
    return key.substring(0, 8) + '...' + key.substring(key.length - 8);
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
          <h1 className="text-2xl font-bold text-gray-900">API Keys</h1>
          <p className="text-gray-600 mt-1">
            Manage your API keys for external integrations.
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Create New Key
        </button>
      </div>

      {/* Create API Key Form */}
      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Create New API Key
          </h3>
          <form onSubmit={handleCreateKey} className="flex space-x-4">
            <div className="flex-1">
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="Enter a name for this API key"
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreateForm(false);
                setNewKeyName('');
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* Integration Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-3">
          How to use API Keys
        </h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p>Use your API key to fetch published blogs from your portfolio website:</p>
          <div className="bg-blue-100 p-3 rounded-lg font-mono text-xs overflow-x-auto">
            <div>GET https://your-supabase-url.supabase.co/rest/v1/blogs</div>
            <div>Authorization: Bearer YOUR_API_KEY</div>
            <div>apikey: YOUR_SUPABASE_ANON_KEY</div>
          </div>
          <p className="text-xs text-blue-600 mt-2">
            Replace YOUR_API_KEY with one of your active API keys below.
          </p>
        </div>
      </div>

      {/* API Keys List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {apiKeys.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {apiKeys.map((apiKey) => (
              <div key={apiKey.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-medium text-gray-900">
                        {apiKey.name}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          apiKey.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {apiKey.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center space-x-2">
                        <code className="px-3 py-1 bg-gray-100 rounded text-sm font-mono">
                          {visibleKeys.has(apiKey.id) ? apiKey.api_key : maskKey(apiKey.api_key)}
                        </code>
                        <button
                          onClick={() => handleToggleVisibility(apiKey.id)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title={visibleKeys.has(apiKey.id) ? 'Hide key' : 'Show key'}
                        >
                          {visibleKeys.has(apiKey.id) ? (
                            <EyeSlashIcon className="h-4 w-4" />
                          ) : (
                            <EyeIcon className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => copyToClipboard(apiKey.api_key)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="Copy to clipboard"
                        >
                          <ClipboardDocumentIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6 mt-2 text-sm text-gray-500">
                      <span>
                        Created {format(new Date(apiKey.created_at), 'MMM d, yyyy')}
                      </span>
                      {apiKey.last_used_at && (
                        <span>
                          Last used {format(new Date(apiKey.last_used_at), 'MMM d, yyyy')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => toggleApiKey(apiKey.id, !apiKey.is_active)}
                      className={`px-3 py-1 text-sm font-medium rounded-lg ${
                        apiKey.is_active
                          ? 'text-yellow-700 bg-yellow-50 hover:bg-yellow-100'
                          : 'text-green-700 bg-green-50 hover:bg-green-100'
                      }`}
                    >
                      {apiKey.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    
                    <button
                      onClick={() => handleDeleteKey(apiKey.id, apiKey.name)}
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No API keys found
            </h3>
            <p className="text-gray-500 mb-6">
              Create your first API key to integrate with external applications.
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Create your first API key
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiKeys;