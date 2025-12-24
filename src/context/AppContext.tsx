import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Plans, Task } from '../types';
import * as storage from '../utils/storage';

// Context Type - Uygulamanın global state'i
interface AppContextType {
  plans: Plans;
  username: string | null;
  isLoading: boolean;
  savePlan: (date: string, tasks: Task[]) => Promise<void>;
  updateTask: (date: string, taskId: string, done: boolean) => Promise<void>;
  setUsername: (name: string) => Promise<void>;
  refreshPlans: () => Promise<void>; // Planları yeniden yükle
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [plans, setPlans] = useState<Plans>({});
  const [username, setUsernameState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // İlk açılışta verileri yükle
  useEffect(() => {
    loadData();
  }, []);

  // Verileri storage'dan yükle
  const loadData = async () => {
    try {
      const [savedPlans, savedUsername] = await Promise.all([
        storage.getAllPlans(),
        storage.getUserName(),
      ]);

      setPlans(savedPlans);
      setUsernameState(savedUsername);
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Planları yeniden yükle (refresh için)
  const refreshPlans = async () => {
    try {
      const savedPlans = await storage.getAllPlans();
      setPlans(savedPlans);
    } catch (error) {
      console.error('Planlar yenilenirken hata:', error);
    }
  };

  // Bir günün planını kaydet
  const savePlan = async (date: string, tasks: Task[]) => {
    try {
      await storage.savePlan(date, tasks);
      // Local state'i de güncelle (UI anında güncellensin)
      setPlans(prev => ({ ...prev, [date]: tasks }));
    } catch (error) {
      console.error('Plan kaydetme hatası:', error);
      throw error;
    }
  };

  // Bir görevi güncelle (done durumunu değiştir)
  const updateTask = async (date: string, taskId: string, done: boolean) => {
    try {
      await storage.updateTask(date, taskId, { done });
      // Local state'i güncelle
      await refreshPlans();
    } catch (error) {
      console.error('Görev güncelleme hatası:', error);
      throw error;
    }
  };

  // Kullanıcı adını kaydet
  // Kullanıcı adını kaydet
  const setUsername = async (name: string) => {
    try {
      await storage.saveUserName(name);
      setUsernameState(name);
    } catch (error) {
      console.error('Kullanıcı adı kaydetme hatası:', error);
      throw error;
    }
  };

  return (
    <AppContext.Provider
      value={{
        plans,
        username,
        isLoading,
        savePlan,
        updateTask,
        setUsername,
        refreshPlans,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Context kullanmak için hook
export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
