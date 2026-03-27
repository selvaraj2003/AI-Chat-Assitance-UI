import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import api from '@/lib/api/axios';
import { toast } from 'react-toastify';

export interface Model {
  id: string;
  name: string;
}

export function useModels() {
  const [selectedModel, setSelectedModel] = useState<string>('');

  const { data: cloudModels = [], isLoading, error } = useQuery({
    queryKey: ['cloudModels'],
    queryFn: async () => {
      try {
        const res = await api.get('/api/ai/models/cloud');
        return res.data.models as string[];
      } catch (err: any) {
        const msg = err?.response?.data?.detail || 'Failed to load cloud models';
        toast.error(msg);
        throw new Error(msg);
      }
    },
  });

  // Set default model once models are loaded
  useEffect(() => {
    if (cloudModels.length > 0 && !selectedModel) {
      setSelectedModel(cloudModels[0]);
    }
  }, [cloudModels, selectedModel]);

  return {
    cloudModels,
    selectedModel,
    setSelectedModel,
    isLoading,
    error,
  };
}
