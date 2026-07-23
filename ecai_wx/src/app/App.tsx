import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { MobileShell } from './components/layout/MobileShell';
import { OnboardingScreen } from './components/screens/user/OnboardingScreen';
import { TaskHall } from './components/screens/user/TaskHall';
import { TaskDetail } from './components/screens/user/TaskDetail';
import { MyTasks } from './components/screens/user/MyTasks';
import { CollectVoice } from './components/screens/user/CollectVoice';
import { CollectText } from './components/screens/user/CollectText';
import { CollectImage } from './components/screens/user/CollectImage';
import { ReviewProgress } from './components/screens/user/ReviewProgress';
import { MyProfile } from './components/screens/user/MyProfile';
import { EditProfile } from './components/screens/user/EditProfile';
import { AuthorizationCenter } from './components/screens/user/AuthorizationCenter';
import { AuthorizationAgreementPage } from './components/screens/user/AuthorizationAgreementPage';
import { AuthorizationSignaturePage } from './components/screens/user/AuthorizationSignaturePage';
import { PointsCenter } from './components/screens/user/PointsCenter';
import { WithdrawPage } from './components/screens/user/WithdrawPage';
import { InvitePage } from './components/screens/user/InvitePage';
import { CertificatePage } from './components/screens/user/CertificatePage';
import { AdminLayout } from './components/screens/admin/AdminLayout';

function UserApp() {
  const { currentScreen } = useApp();

  switch (currentScreen) {
    case 'onboarding':    return <OnboardingScreen />;
    case 'task-hall':     return <TaskHall />;
    case 'task-detail':   return <TaskDetail />;
    case 'my-tasks':      return <MyTasks />;
    case 'collect-voice': return <CollectVoice />;
    case 'collect-text':  return <CollectText />;
    case 'collect-image': return <CollectImage />;
    case 'review-progress': return <ReviewProgress />;
    case 'my-profile':    return <MyProfile />;
    case 'edit-profile':  return <EditProfile />;
    case 'authorization-center': return <AuthorizationCenter />;
    case 'authorization-agreement': return <AuthorizationAgreementPage />;
    case 'authorization-signature': return <AuthorizationSignaturePage />;
    case 'points-center': return <PointsCenter />;
    case 'withdraw':      return <WithdrawPage />;
    case 'invite':        return <InvitePage />;
    case 'certificates':  return <CertificatePage />;
    default:              return <TaskHall />;
  }
}

function AppFrame() {
  const [showAdmin, setShowAdmin] = useState(false);
  const { currentScreen } = useApp();

  if (showAdmin) {
    return <AdminLayout onExit={() => setShowAdmin(false)} />;
  }

  return (
    <div className="relative">
      <MobileShell>
        <UserApp />
      </MobileShell>

      {currentScreen !== 'authorization-signature' && (
        <button
          onClick={() => setShowAdmin(true)}
          className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-2.5 rounded-full text-white text-sm font-semibold shadow-lg hover:shadow-xl transition-all active:scale-95"
          style={{ background: '#2E3D4F', zIndex: 100 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="7" height="7" rx="1.5" fill="white" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" fill="white" opacity="0.6" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" fill="white" opacity="0.6" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" fill="white" opacity="0.3" />
          </svg>
          运营后台
        </button>
      )}
    </div>
  );
}

export default function App() {
  return <AppProvider><AppFrame /></AppProvider>;
}
