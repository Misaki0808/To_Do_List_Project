import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Plans, Task } from '../types';

interface AppContextType {
  plans: Plans;
  username: string | null;
  isLoading: boolean;
  savePlan: (date: string, tasks: Task[]) => Promise<void>;
  updateTask: (date: string, taskId: string, done: boolean) => Promise<void>;
  setUsername: (name: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PLANS: '@daily_planner_plans',
  USERNAME: '@daily_planner_username',
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [plans, setPlans] = useState<Plans>({});
  const [username, setUsernameState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // İlk açılışta verileri yükle
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [savedPlans, savedUsername] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.PLANS),
        AsyncStorage.getItem(STORAGE_KEYS.USERNAME),
      ]);

      if (savedPlans) {
        setPlans(JSON.parse(savedPlans));
      }
      if (savedUsername) {
        setUsernameState(savedUsername);
      }
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Bir günün planını kaydet
  const savePlan = async (date: string, tasks: Task[]) => {
    try {
      const newPlans = { ...plans, [date]: tasks };
      setPlans(newPlans);
      await AsyncStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(newPlans));
    } catch (error) {
      console.error('Plan kaydetme hatası:', error);
      throw error;
    }
  };

  // Bir görevi güncelle (done durumunu değiştir)
  const updateTask = async (date: string, taskId: string, done: boolean) => {
    try {
      const dayTasks = plans[date] || [];
      const updatedTasks = dayTasks.map(task =>
        task.id === taskId ? { ...task, done } : task
      );
      
      const newPlans = { ...plans, [date]: updatedTasks };
      setPlans(newPlans);
      await AsyncStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(newPlans));
    } catch (error) {
      console.error('Görev güncelleme hatası:', error);
      throw error;
    }
  };

  // Kullanıcı adını kaydet
  const setUsername = async (name: string) => {
    try {
      setUsernameState(name);
      await AsyncStorage.setItem(STORAGE_KEYS.USERNAME, name);
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
