import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { DashboardPage } from '../pages/DashboardPage';
import { TasksPage } from '../pages/TasksPage';
import { TaskCreatePage } from '../pages/TaskCreatePage';
import { ChildrenPage } from '../pages/ChildrenPage';
import { TaskDetailPage } from '../pages/TaskDetailPage';
import { RewardsPage } from '../pages/RewardsPage';
import { RewardCreatePage } from '../pages/RewardCreatePage';
import { ExchangeHistoryPage } from '../pages/ExchangeHistoryPage';
import { SettingsPage } from '../pages/SettingsPage';
import { PointsHistoryPage } from '../pages/PointsHistoryPage';
import { StatsPage } from '../pages/StatsPage';
import { TemplatesPage } from '../pages/TemplatesPage';
import { TemplateFormPage } from '../pages/TemplateFormPage';
import { CalendarPage } from '../pages/CalendarPage';
import { BadgesPage } from '../pages/BadgesPage';
import { NotificationSettingsPage } from '../pages/NotificationSettingsPage';
import { SoundSettingsPage } from '../pages/SoundSettingsPage';
import { AppLayout } from '../components/layout/AppLayout';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'tasks',
        element: <TasksPage />,
      },
      {
        path: 'tasks/create',
        element: (
          <ProtectedRoute requireParent>
            <TaskCreatePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'tasks/:id',
        element: <TaskDetailPage />,
      },
      {
        path: 'calendar',
        element: <CalendarPage />,
      },
      {
        path: 'children',
        element: (
          <ProtectedRoute requireParent>
            <ChildrenPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'rewards',
        element: <RewardsPage />,
      },
      {
        path: 'rewards/create',
        element: (
          <ProtectedRoute requireParent>
            <RewardCreatePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'rewards/history',
        element: <ExchangeHistoryPage />,
      },
      {
        path: 'rewards/points-history',
        element: <PointsHistoryPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: 'stats',
        element: <StatsPage />,
      },
      {
        path: 'templates',
        element: (
          <ProtectedRoute requireParent>
            <TemplatesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'templates/create',
        element: (
          <ProtectedRoute requireParent>
            <TemplateFormPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'templates/:id/edit',
        element: (
          <ProtectedRoute requireParent>
            <TemplateFormPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'badges',
        element: <BadgesPage />,
      },
      {
        path: 'notifications/settings',
        element: <NotificationSettingsPage />,
      },
      {
        path: 'sound/settings',
        element: <SoundSettingsPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
