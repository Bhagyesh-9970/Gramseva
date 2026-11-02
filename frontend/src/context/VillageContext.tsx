import React, { createContext, useContext, useState, useEffect } from 'react';
import { Village } from '../types';

interface VillageContextType {
  villages: Village[];
  selectedVillageId: string; // "ALL" or specific village id
  selectedVillage: Village | null;
  setSelectedVillageId: (id: string) => void;
  isLoading: boolean;
  refreshVillages: () => Promise<void>;
}

const VillageContext = createContext<VillageContextType>({
  villages: [],
  selectedVillageId: 'v-shiva',
  selectedVillage: null,
  setSelectedVillageId: () => {},
  isLoading: true,
  refreshVillages: async () => {},
});

export const VillageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [villages, setVillages] = useState<Village[]>([]);
  const [selectedVillageId, setSelectedVillageIdState] = useState<string>(() => {
    return localStorage.getItem('gp_selected_village') || 'v-shiva';
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchVillages = async () => {
    try {
      const res = await fetch('/api/villages');
      if (res.ok) {
        const data = await res.json();
        setVillages(data);
      }
    } catch (e) {
      console.error('Error fetching villages:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVillages();
  }, []);

  const setSelectedVillageId = (id: string) => {
    setSelectedVillageIdState(id);
    localStorage.setItem('gp_selected_village', id);
  };

  const selectedVillage = villages.find(v => v.id === selectedVillageId) || null;

  return (
    <VillageContext.Provider value={{
      villages,
      selectedVillageId,
      selectedVillage,
      setSelectedVillageId,
      isLoading,
      refreshVillages: fetchVillages
    }}>
      {children}
    </VillageContext.Provider>
  );
};

export const useVillage = () => useContext(VillageContext);
