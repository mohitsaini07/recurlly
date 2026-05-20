import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { HOME_SUBSCRIPTIONS } from '@/constants/data';

type SubscriptionContextType = {
  subscriptions: any[];
  addSubscription: (sub: any) => void;
  removeSubscription: (id: string) => void;
  updateSubscription: (id: string, updates: any) => void;
};

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

export const SubscriptionProvider = ({ children }: { children: React.ReactNode }) => {
  const [subscriptions, setSubscriptions] = useState<any[]>(HOME_SUBSCRIPTIONS);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const stored = await SecureStore.getItemAsync('recurlly_subs');
        if (stored) {
          setSubscriptions(JSON.parse(stored));
        }
      } catch (e) {
        console.error('Failed to load subscriptions', e);
      } finally {
        setIsInitialized(true);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (isInitialized) {
      SecureStore.setItemAsync('recurlly_subs', JSON.stringify(subscriptions)).catch(e => {
        console.error('Failed to save subscriptions', e);
      });
    }
  }, [subscriptions, isInitialized]);

  const addSubscription = (sub: any) => {
    setSubscriptions(prev => [sub, ...prev]);
  };

  const removeSubscription = (id: string) => {
    setSubscriptions(prev => prev.filter(s => s.id !== id));
  };

  const updateSubscription = (id: string, updates: any) => {
    setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  return (
    <SubscriptionContext.Provider value={{ subscriptions, addSubscription, removeSubscription, updateSubscription }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscriptions = () => {
  const context = useContext(SubscriptionContext);
  if (!context) throw new Error("useSubscriptions must be used within SubscriptionProvider");
  return context;
};
