import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppShell } from './layout/AppShell';
import { PublicShell } from './layout/PublicShell';
import { RequireAuth } from './RequireAuth';
import { NotFound } from './NotFound';

import { Landing } from '../features/auth/Landing';
import { About } from '../features/misc/About';

import { Home } from '../features/home/Home';

import { ProblemList } from '../features/problems/ProblemList';
import { ProblemSolve } from '../features/problems/ProblemSolve';
import { ProblemForm } from '../features/problems/ProblemForm';

import { ContestList } from '../features/contests/ContestList';
import { ContestDetail } from '../features/contests/ContestDetail';
import { ContestRankings } from '../features/contests/ContestRankings';
import { ContestCreate } from '../features/contests/ContestCreate';

import { QueryList } from '../features/queries/QueryList';
import { QueryDetail } from '../features/queries/QueryDetail';
import { QueryPost } from '../features/queries/QueryPost';

import { PlaygroundEnter } from '../features/playground/PlaygroundEnter';
import { PlaygroundRoom } from '../features/playground/PlaygroundRoom';

import { ConnectDirectory } from '../features/connect/ConnectDirectory';
import { ProfileDashboard } from '../features/profile/ProfileDashboard';
import { Settings } from '../features/settings/Settings';
import { Blog } from '../features/misc/Blog';

/*
 * Two shells, one rule: anything that renders inside AppShell is behind
 * RequireAuth. The public tree is deliberately tiny — a landing page and an
 * about page — so there is no ambiguity about what an anonymous visitor can
 * reach. Adding a feature route under AppShell makes it private by default.
 */
const router = createBrowserRouter([
  {
    element: <PublicShell />,
    children: [
      { path: '/', element: <Landing /> },
      { path: '/about', element: <About /> },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/home', element: <Home /> },

          { path: '/problems', element: <ProblemList /> },
          { path: '/problems/new', element: <ProblemForm mode="standalone" /> },
          { path: '/problems/:id', element: <ProblemSolve /> },

          { path: '/contests', element: <ContestList /> },
          { path: '/contests/new', element: <ContestCreate /> },
          { path: '/contests/:id', element: <ContestDetail /> },
          { path: '/contests/:id/rankings', element: <ContestRankings /> },

          { path: '/queries', element: <QueryList /> },
          { path: '/queries/new', element: <QueryPost /> },
          { path: '/queries/:id', element: <QueryDetail /> },

          { path: '/playground', element: <PlaygroundEnter /> },
          { path: '/playground/:roomId', element: <PlaygroundRoom /> },

          { path: '/connect', element: <ConnectDirectory /> },
          { path: '/u/:id', element: <ProfileDashboard /> },
          { path: '/settings', element: <Settings /> },
          { path: '/blog', element: <Blog /> },

          { path: '*', element: <NotFound /> },
        ],
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
