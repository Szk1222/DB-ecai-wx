import React, { createContext, useContext, useState, ReactNode } from 'react';
import { USER_PROFILE } from '../data/mockData';
import type { SignedAuthorizationAgreement } from '../data/authorizationAgreement';

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
  | 'account-security'
  | 'authorization-center'
  | 'authorization-agreement'
  | 'authorization-signature'
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
  selectedAuthorizationId: string | null;
  authorizationReturnScreen: Screen | null;
  editProfileReturnScreen: Screen | null;
  signedAgreements: Record<string, SignedAuthorizationAgreement>;
  user: typeof USER_PROFILE;
  updateProfile: (profile: Partial<typeof USER_PROFILE>) => void;
  navigate: (screen: Screen, params?: { taskId?: string; userTaskId?: string; authorizationId?: string; returnTo?: Screen }) => void;
  saveSignedAgreement: (agreement: SignedAuthorizationAgreement) => void;
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
  const [selectedAuthorizationId, setSelectedAuthorizationId] = useState<string | null>(null);
  const [authorizationReturnScreen, setAuthorizationReturnScreen] = useState<Screen | null>(null);
  const [editProfileReturnScreen, setEditProfileReturnScreen] = useState<Screen | null>(null);
  const [signedAgreements, setSignedAgreements] = useState<Record<string, SignedAuthorizationAgreement>>({});
  const [user, setUser] = useState(USER_PROFILE);

  function updateProfile(profile: Partial<typeof USER_PROFILE>) {
    setUser((current) => ({ ...current, ...profile }));
  }

  function navigate(screen: Screen, params?: { taskId?: string; userTaskId?: string; authorizationId?: string; returnTo?: Screen }) {
    setCurrentScreen(screen);
    if (params?.taskId !== undefined) setSelectedTaskId(params.taskId);
    if (params?.userTaskId !== undefined) setSelectedUserTaskId(params.userTaskId);
    if (params?.authorizationId !== undefined) setSelectedAuthorizationId(params.authorizationId);
    if (screen === 'authorization-agreement' && params?.returnTo !== undefined) setAuthorizationReturnScreen(params.returnTo);
    if (screen === 'edit-profile') setEditProfileReturnScreen(params?.returnTo ?? null);
    if (screen === 'authorization-center') setAuthorizationReturnScreen(null);
  }

  function saveSignedAgreement(agreement: SignedAuthorizationAgreement) {
    setSignedAgreements((current) => {
      const previous = current[agreement.recordId];
      if (previous?.pdfUrl?.startsWith('blob:')) URL.revokeObjectURL(previous.pdfUrl);
      return { ...current, [agreement.recordId]: agreement };
    });
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
        selectedAuthorizationId,
        authorizationReturnScreen,
        editProfileReturnScreen,
        signedAgreements,
        user,
        updateProfile,
        navigate,
        saveSignedAgreement,
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
