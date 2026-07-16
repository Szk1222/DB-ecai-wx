import React, { createContext, useContext, useState, ReactNode } from 'react';
import { USER_PROFILE } from '../data/mockData';

type Screen =
  | 'onboarding'
  | 'task-hall'
  | 'task-detail'
  | 'my-tasks'
  | 'collect-voice'
  | 'collect-text'
  | 'collect-image'
  | 'review-progress'
  | 'my-profile'
  | 'edit-profile'
  | 'authorization-center'
  | 'points-center'
  | 'withdraw'
  | 'invite'
  | 'certificates';

type Tab = 'tasks' | 'me';

interface AppState {
  isLoggedIn: boolean;
  currentScreen: Screen;
  currentTab: Tab;
  selectedTaskId: string | null;
  selectedUserTaskId: string | null;
  user: typeof USER_PROFILE;
  updateProfile: (profile: Partial<typeof USER_PROFILE>) => void;
  navigate: (screen: Screen, params?: { taskId?: string; userTaskId?: string }) => void;
  setTab: (tab: Tab) => void;
  login: () => void;
  logout: () => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<Screen>('onboarding');
  const [currentTab, setCurrentTab] = useState<Tab>('tasks');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedUserTaskId, setSelectedUserTaskId] = useState<string | null>(null);
  const [user, setUser] = useState(USER_PROFILE);

  function updateProfile(profile: Partial<typeof USER_PROFILE>) {
    setUser((current) => ({ ...current, ...profile }));
  }

  function navigate(screen: Screen, params?: { taskId?: string; userTaskId?: string }) {
    setCurrentScreen(screen);
    if (params?.taskId !== undefined) setSelectedTaskId(params.taskId);
    if (params?.userTaskId !== undefined) setSelectedUserTaskId(params.userTaskId);
  }

  function setTab(tab: Tab) {
    setCurrentTab(tab);
    if (tab === 'tasks') navigate('task-hall');
    else navigate('my-profile');
  }

  function login() {
    setIsLoggedIn(true);
    setCurrentScreen('task-hall');
  }

  function logout() {
    setIsLoggedIn(false);
    setCurrentScreen('onboarding');
  }

  return (
    <AppContext.Provider
      value={{
        isLoggedIn,
        currentScreen,
        currentTab,
        selectedTaskId,
        selectedUserTaskId,
        user,
        updateProfile,
        navigate,
        setTab,
        login,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
