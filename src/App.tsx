import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/contexts/AuthContext';
import { GameProvider } from '@/contexts/GameContext';
import { AchievementProvider } from '@/contexts/AchievementContext';
import ProtectedRoute from '@/components/ProtectedRoute';

// Public Pages
import Index from '@/pages/Index';
import NotFound from '@/pages/NotFound';

// Auth Pages
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import ResetPassword from '@/pages/auth/ResetPassword';
import AuthCallback from '@/pages/auth/AuthCallback';

// Protected Pages
import Game from '@/pages/Game';
import Profile from '@/pages/Profile';
import Crew from '@/pages/Crew';
import Settings from '@/pages/Settings';
import TestImprovements from '@/pages/TestImprovements';
import SpotCapture from '@/pages/SpotCapture';

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router>
          <AuthProvider>
            <GameProvider>
              <AchievementProvider>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/test" element={<TestImprovements />} />
                  <Route path="/spot-capture" element={<SpotCapture />} />
                  <Route path="/auth/login" element={<Login />} />
                  <Route path="/auth/register" element={<Register />} />
                  <Route path="/auth/forgot-password" element={<ForgotPassword />} />
                  <Route path="/auth/reset-password" element={<ResetPassword />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />

                  {/* Game Routes - Temporarily Public for Testing */}
                  <Route path="/game" element={<Game />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/crew" element={<Crew />} />
                  <Route path="/settings" element={<Settings />} />

                  {/* Protected Routes - Disabled for now */}
                  {/* <Route element={<ProtectedRoute />}>
                    <Route path="/game" element={<Game />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/crew" element={<Crew />} />
                    <Route path="/settings" element={<Settings />} />
                  </Route> */}

                  {/* 404 */}
                  <Route path="/404" element={<NotFound />} />
                  <Route path="*" element={<Navigate to="/404" replace />} />
                </Routes>

                <Toaster />
                <Sonner position="top-center" richColors />
              </AchievementProvider>
            </GameProvider>
          </AuthProvider>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
