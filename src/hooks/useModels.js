import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../api/axios";

export function useModels() {
  const [localModels, setLocalModels]   = useState([]);
  const [cloudModels, setCloudModels]   = useState([]);
  const [provider, setProvider]         = useState("local");
  const [selectedModel, setSelectedModel] = useState("");

  const loadModels = async (prov) => {
    try {
      const res = await api.get(`/api/ai/models/${prov}`);
      const list = res.data.models || [];
      if (prov === "local") {
        setLocalModels(list);
        if (prov === provider && list.length > 0)
          setSelectedModel(res.data.default || list[0]);
      } else {
        setCloudModels(list);
        if (prov === provider && list.length > 0)
          setSelectedModel(res.data.default || list[0]);
      }
    } catch {
      toast.error(`Failed to load ${prov} models`);
    }
  };

  useEffect(() => {
    loadModels("local");
    loadModels("cloud");
  }, []);

  const models = provider === "local" ? localModels : cloudModels;

  return { models, localModels, cloudModels, provider, setProvider, selectedModel, setSelectedModel };
}