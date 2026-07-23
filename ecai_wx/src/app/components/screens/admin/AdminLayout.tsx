import React, { useState } from 'react';
import { ConfigProvider, Layout, Menu, Badge } from 'antd';
import {
  DashboardOutlined,
  OrderedListOutlined,
  AuditOutlined,
  TeamOutlined,
  AccountBookOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  FileTextOutlined,
  RobotOutlined,
  NodeIndexOutlined,
} from '@ant-design/icons';
import { AdminDashboard } from './AdminDashboard';
import { AdminProjects } from './AdminProjects';
import { AdminQC } from './AdminQC';
import { AdminUsers } from './AdminUsers';
import { AdminSettle } from './AdminSettle';
import { AdminTemplates } from './AdminTemplates';
import { AdminModels } from './AdminModels';
import { AdminProcesses } from './AdminProcesses';

const { Sider, Header, Content } = Layout;

type AdminPage = 'dashboard' | 'tasks' | 'qc' | 'users' | 'settle' | 'templates' | 'processes' | 'models';

const MENU_ITEMS = [
  { key: 'dashboard', icon: <DashboardOutlined />, label: '运营看板' },
  { key: 'tasks', icon: <OrderedListOutlined />, label: '项目管理' },
  { key: 'qc', icon: <AuditOutlined />, label: '质检工作台', badge: 3 },
  { key: 'users', icon: <TeamOutlined />, label: '用户管理' },
  { key: 'settle', icon: <AccountBookOutlined />, label: '结算中心' },
  { key: 'templates', icon: <FileTextOutlined />, label: '模板配置' },
  { key: 'processes', icon: <NodeIndexOutlined />, label: '流程配置' },
  { key: 'models', icon: <RobotOutlined />, label: '模型配置' },
];

const PAGE_TITLES: Record<AdminPage, string> = {
  dashboard: '运营看板',
  tasks: '项目管理',
  qc: '质检工作台',
  users: '用户管理',
  settle: '结算中心',
  templates: '模板配置',
  processes: '流程配置',
  models: '模型配置',
};

export function AdminLayout({ onExit }: { onExit: () => void }) {
  const [collapsed, setCollapsed] = useState(false);
  const [page, setPage] = useState<AdminPage>('dashboard');

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <AdminDashboard />;
      case 'tasks': return <AdminProjects />;
      case 'qc': return <AdminQC />;
      case 'users': return <AdminUsers />;
      case 'settle': return <AdminSettle />;
      case 'templates': return <AdminTemplates />;
      case 'processes': return <AdminProcesses />;
      case 'models': return <AdminModels />;
    }
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#3DBFA0',
          borderRadius: 8,
          colorBgContainer: '#ffffff',
        },
      }}
    >
      <Layout style={{ height: '100vh', overflow: 'hidden' }}>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          trigger={null}
          width={220}
          style={{ background: '#2E3D4F', overflow: 'auto' }}
        >
          {/* Logo */}
          <div style={{ padding: collapsed ? '20px 12px' : '20px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, background: '#3DBFA0', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 36 36" fill="none">
                  <rect x="4" y="22" width="28" height="6" rx="3" fill="white" opacity="0.6" />
                  <rect x="2" y="14" width="32" height="10" rx="4" fill="white" opacity="0.8" />
                  <rect x="0" y="6" width="36" height="10" rx="5" fill="white" />
                </svg>
              </div>
              {!collapsed && (
                <div>
                  <div style={{ color: 'white', fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>标贝易采</div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>运营管理后台</div>
                </div>
              )}
            </div>
          </div>

          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[page]}
            style={{ background: 'transparent', border: 'none', marginTop: 8 }}
            onSelect={({ key }) => setPage(key as AdminPage)}
            items={MENU_ITEMS.map((item) => ({
              key: item.key,
              icon: item.icon,
              label: item.badge ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {item.label}
                  <Badge count={item.badge} size="small" />
                </span>
              ) : item.label,
            }))}
          />

          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <Menu
              theme="dark"
              mode="inline"
              style={{ background: 'transparent', border: 'none' }}
              items={[
                { key: 'exit', icon: <LogoutOutlined />, label: '退出后台', onClick: onExit },
              ]}
            />
          </div>
        </Sider>

        <Layout>
          <Header
            style={{
              background: 'white',
              padding: '0 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
              height: 56,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                onClick={() => setCollapsed(!collapsed)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', fontSize: 18 }}
              >
                {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              </button>
              <h1 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#1a1a2e' }}>
                {PAGE_TITLES[page]}
              </h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Badge count={3} size="small">
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', fontSize: 18 }}>
                  <BellOutlined />
                </button>
              </Badge>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#3DBFA0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 13, fontWeight: 600 }}>
                  运
                </div>
                <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>运营管理员</span>
              </div>
            </div>
          </Header>

          <Content
            style={{
              background: '#F5F6F8',
              overflow: 'auto',
              height: 'calc(100vh - 56px)',
              padding: 20,
            }}
          >
            {renderPage()}
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}
