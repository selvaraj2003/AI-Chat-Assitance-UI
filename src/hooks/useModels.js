import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../api/axios";

export function useModels() {
  const [cloudModels, setCloudModels]     = useState([]);
  const [selectedModel, setSelectedModel] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/api/ai/models/cloud");
        const list = res.data.models || [];
        setCloudModels(list);
        if (list.length > 0)
          setSelectedModel(res.data.default || list[0]);
      } catch (err) {
        toast.error(err?.response?.data?.detail || "Failed to load cloud models");
      }
    })();
  }, []);

  return { cloudModels, selectedModel, setSelectedModel };
}