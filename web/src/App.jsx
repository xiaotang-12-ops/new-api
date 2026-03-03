/*
Copyright (C) 2025 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/

import React, { lazy, Suspense, useContext, useMemo } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Loading from './components/common/ui/Loading';
import User from './pages/User';
import {
  AuthRedirect,
  PrivateRoute,
  AdminRoute,
  SidebarModuleRoute,
} from './helpers';
import RegisterForm from './components/auth/RegisterForm';
import LoginForm from './components/auth/LoginForm';
import NotFound from './pages/NotFound';
import Forbidden from './pages/Forbidden';
import Setting from './pages/Setting';
import { StatusContext } from './context/Status';

import PasswordResetForm from './components/auth/PasswordResetForm';
import PasswordResetConfirm from './components/auth/PasswordResetConfirm';
import Channel from './pages/Channel';
import Token from './pages/Token';
import Redemption from './pages/Redemption';
import TopUp from './pages/TopUp';
import Log from './pages/Log';
import Chat from './pages/Chat';
import Chat2Link from './pages/Chat2Link';
import Midjourney from './pages/Midjourney';
import Pricing from './pages/Pricing';
import Task from './pages/Task';
import ModelPage from './pages/Model';
import ModelDeploymentPage from './pages/ModelDeployment';
import Playground from './pages/Playground';
import OAuth2Callback from './components/auth/OAuth2Callback';
import PersonalSetting from './components/settings/PersonalSetting';
import Setup from './pages/Setup';
import SetupCheck from './components/layout/SetupCheck';
import { useSidebar } from './hooks/common/useSidebar';

const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const About = lazy(() => import('./pages/About'));
const UserAgreement = lazy(() => import('./pages/UserAgreement'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));

function ConsoleLandingRoute() {
  const { loading, isModuleVisible } = useSidebar();

  if (loading) {
    return <Loading />;
  }

  if (isModuleVisible('console', 'detail')) {
    return (
      <Suspense fallback={<Loading />}>
        <Dashboard />
      </Suspense>
    );
  }

  const consoleFallbackRoutes = [
    { moduleKey: 'token', path: '/console/token' },
    { moduleKey: 'log', path: '/console/log' },
    { moduleKey: 'midjourney', path: '/console/midjourney' },
    { moduleKey: 'task', path: '/console/task' },
  ];

  const firstVisibleRoute = consoleFallbackRoutes.find((item) =>
    isModuleVisible('console', item.moduleKey),
  );

  if (firstVisibleRoute) {
    return <Navigate to={firstVisibleRoute.path} replace />;
  }

  return <Navigate to='/forbidden' replace />;
}

function App() {
  const location = useLocation();
  const [statusState] = useContext(StatusContext);

  // 获取模型广场权限配置
  const pricingRequireAuth = useMemo(() => {
    const headerNavModulesConfig = statusState?.status?.HeaderNavModules;
    if (headerNavModulesConfig) {
      try {
        const modules = JSON.parse(headerNavModulesConfig);

        // 处理向后兼容性：如果pricing是boolean，默认不需要登录
        if (typeof modules.pricing === 'boolean') {
          return false; // 默认不需要登录鉴权
        }

        // 如果是对象格式，使用requireAuth配置
        return modules.pricing?.requireAuth === true;
      } catch (error) {
        console.error('解析顶栏模块配置失败:', error);
        return false; // 默认不需要登录
      }
    }
    return false; // 默认不需要登录
  }, [statusState?.status?.HeaderNavModules]);

  return (
    <SetupCheck>
      <Routes>
        <Route
          path='/'
          element={
            <Suspense fallback={<Loading></Loading>} key={location.pathname}>
              <Home />
            </Suspense>
          }
        />
        <Route
          path='/setup'
          element={
            <Suspense fallback={<Loading></Loading>} key={location.pathname}>
              <Setup />
            </Suspense>
          }
        />
        <Route path='/forbidden' element={<Forbidden />} />
        <Route
          path='/console/models'
          element={
            <AdminRoute>
              <SidebarModuleRoute sectionKey='admin' moduleKey='models'>
                <ModelPage />
              </SidebarModuleRoute>
            </AdminRoute>
          }
        />
        <Route
          path='/console/deployment'
          element={
            <AdminRoute>
              <SidebarModuleRoute sectionKey='admin' moduleKey='deployment'>
                <ModelDeploymentPage />
              </SidebarModuleRoute>
            </AdminRoute>
          }
        />
        <Route
          path='/console/channel'
          element={
            <AdminRoute>
              <SidebarModuleRoute sectionKey='admin' moduleKey='channel'>
                <Channel />
              </SidebarModuleRoute>
            </AdminRoute>
          }
        />
        <Route
          path='/console/token'
          element={
            <PrivateRoute>
              <SidebarModuleRoute sectionKey='console' moduleKey='token'>
                <Token />
              </SidebarModuleRoute>
            </PrivateRoute>
          }
        />
        <Route
          path='/console/playground'
          element={
            <PrivateRoute>
              <SidebarModuleRoute sectionKey='chat' moduleKey='playground'>
                <Playground />
              </SidebarModuleRoute>
            </PrivateRoute>
          }
        />
        <Route
          path='/console/redemption'
          element={
            <AdminRoute>
              <SidebarModuleRoute sectionKey='admin' moduleKey='redemption'>
                <Redemption />
              </SidebarModuleRoute>
            </AdminRoute>
          }
        />
        <Route
          path='/console/user'
          element={
            <AdminRoute>
              <SidebarModuleRoute sectionKey='admin' moduleKey='user'>
                <User />
              </SidebarModuleRoute>
            </AdminRoute>
          }
        />
        <Route
          path='/user/reset'
          element={
            <Suspense fallback={<Loading></Loading>} key={location.pathname}>
              <PasswordResetConfirm />
            </Suspense>
          }
        />
        <Route
          path='/login'
          element={
            <Suspense fallback={<Loading></Loading>} key={location.pathname}>
              <AuthRedirect>
                <LoginForm />
              </AuthRedirect>
            </Suspense>
          }
        />
        <Route
          path='/register'
          element={
            <Suspense fallback={<Loading></Loading>} key={location.pathname}>
              <AuthRedirect>
                <RegisterForm />
              </AuthRedirect>
            </Suspense>
          }
        />
        <Route
          path='/reset'
          element={
            <Suspense fallback={<Loading></Loading>} key={location.pathname}>
              <PasswordResetForm />
            </Suspense>
          }
        />
        <Route
          path='/oauth/github'
          element={
            <Suspense fallback={<Loading></Loading>} key={location.pathname}>
              <OAuth2Callback type='github'></OAuth2Callback>
            </Suspense>
          }
        />
        <Route
          path='/oauth/discord'
          element={
            <Suspense fallback={<Loading></Loading>} key={location.pathname}>
              <OAuth2Callback type='discord'></OAuth2Callback>
            </Suspense>
          }
        />
        <Route
          path='/oauth/oidc'
          element={
            <Suspense fallback={<Loading></Loading>}>
              <OAuth2Callback type='oidc'></OAuth2Callback>
            </Suspense>
          }
        />
        <Route
          path='/oauth/linuxdo'
          element={
            <Suspense fallback={<Loading></Loading>} key={location.pathname}>
              <OAuth2Callback type='linuxdo'></OAuth2Callback>
            </Suspense>
          }
        />
        <Route
          path='/console/setting'
          element={
            <AdminRoute>
              <SidebarModuleRoute sectionKey='admin' moduleKey='setting'>
                <Suspense fallback={<Loading></Loading>} key={location.pathname}>
                  <Setting />
                </Suspense>
              </SidebarModuleRoute>
            </AdminRoute>
          }
        />
        <Route
          path='/console/personal'
          element={
            <PrivateRoute>
              <SidebarModuleRoute sectionKey='personal' moduleKey='personal'>
                <Suspense fallback={<Loading></Loading>} key={location.pathname}>
                  <PersonalSetting />
                </Suspense>
              </SidebarModuleRoute>
            </PrivateRoute>
          }
        />
        <Route
          path='/console/topup'
          element={
            <PrivateRoute>
              <SidebarModuleRoute sectionKey='personal' moduleKey='topup'>
                <Suspense fallback={<Loading></Loading>} key={location.pathname}>
                  <TopUp />
                </Suspense>
              </SidebarModuleRoute>
            </PrivateRoute>
          }
        />
        <Route
          path='/console/log'
          element={
            <PrivateRoute>
              <SidebarModuleRoute sectionKey='console' moduleKey='log'>
                <Log />
              </SidebarModuleRoute>
            </PrivateRoute>
          }
        />
        <Route
          path='/console'
          element={
            <PrivateRoute>
              <ConsoleLandingRoute />
            </PrivateRoute>
          }
        />
        <Route
          path='/console/midjourney'
          element={
            <PrivateRoute>
              <SidebarModuleRoute sectionKey='console' moduleKey='midjourney'>
                <Suspense fallback={<Loading></Loading>} key={location.pathname}>
                  <Midjourney />
                </Suspense>
              </SidebarModuleRoute>
            </PrivateRoute>
          }
        />
        <Route
          path='/console/task'
          element={
            <PrivateRoute>
              <SidebarModuleRoute sectionKey='console' moduleKey='task'>
                <Suspense fallback={<Loading></Loading>} key={location.pathname}>
                  <Task />
                </Suspense>
              </SidebarModuleRoute>
            </PrivateRoute>
          }
        />
        <Route
          path='/pricing'
          element={
            pricingRequireAuth ? (
              <PrivateRoute>
                <Suspense
                  fallback={<Loading></Loading>}
                  key={location.pathname}
                >
                  <Pricing />
                </Suspense>
              </PrivateRoute>
            ) : (
              <Suspense fallback={<Loading></Loading>} key={location.pathname}>
                <Pricing />
              </Suspense>
            )
          }
        />
        <Route
          path='/about'
          element={
            <Suspense fallback={<Loading></Loading>} key={location.pathname}>
              <About />
            </Suspense>
          }
        />
        <Route
          path='/user-agreement'
          element={
            <Suspense fallback={<Loading></Loading>} key={location.pathname}>
              <UserAgreement />
            </Suspense>
          }
        />
        <Route
          path='/privacy-policy'
          element={
            <Suspense fallback={<Loading></Loading>} key={location.pathname}>
              <PrivacyPolicy />
            </Suspense>
          }
        />
        <Route
          path='/console/chat/:id?'
          element={
            <PrivateRoute>
              <SidebarModuleRoute sectionKey='chat' moduleKey='chat'>
                <Suspense fallback={<Loading></Loading>} key={location.pathname}>
                  <Chat />
                </Suspense>
              </SidebarModuleRoute>
            </PrivateRoute>
          }
        />
        {/* 方便使用chat2link直接跳转聊天... */}
        <Route
          path='/chat2link'
          element={
            <PrivateRoute>
              <SidebarModuleRoute sectionKey='chat' moduleKey='chat'>
                <Suspense fallback={<Loading></Loading>} key={location.pathname}>
                  <Chat2Link />
                </Suspense>
              </SidebarModuleRoute>
            </PrivateRoute>
          }
        />
        <Route path='*' element={<NotFound />} />
      </Routes>
    </SetupCheck>
  );
}

export default App;
