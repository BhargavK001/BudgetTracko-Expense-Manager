import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from './context/ThemeContext';
import { GlobalProvider } from './context/GlobalContext';
import { AuthProvider } from './context/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'sonner';
import Layout from './components/layout/Layout';
import PublicRoute from './components/PublicRoute';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/layout/AdminLayout';
import PageLoader from './components/common/PageLoader';

// Eagerly loaded critical pages (Only LandingPage to avoid waterfall delays on first paint)
import LandingPage from './pages/LandingPage';

// Lazy loaded critical pages
const Login = React.lazy(() => import('./pages/Login'));
const Signup = React.lazy(() => import('./pages/Signup'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

// Lazy loaded pages
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Transactions = React.lazy(() => import('./pages/Transactions'));
const Analytics = React.lazy(() => import('./pages/Analytics'));
const RecurringBills = React.lazy(() => import('./pages/RecurringBills'));
const Accounts = React.lazy(() => import('./pages/Accounts'));
const Settings = React.lazy(() => import('./pages/Settings'));
const Billing = React.lazy(() => import('./pages/Billing'));

// AskTracko features
const AskTracko = React.lazy(() => import('./pages/AskTracko/AskTracko'));
const PulseHub = React.lazy(() => import('./pages/AskTracko/PulseHub'));
const PulseAnalysisDashboard = React.lazy(() => import('./pages/AskTracko/PulseAnalysisDashboard'));

// Public/Auth pages
const Contact = React.lazy(() => import('./pages/Contact'));
const Features = React.lazy(() => import('./pages/Features'));
const Pricing = React.lazy(() => import('./pages/Pricing'));
const About = React.lazy(() => import('./pages/About'));
const Privacy = React.lazy(() => import('./pages/Privacy'));
const TermsOfService = React.lazy(() => import('./pages/TermsOfService'));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = React.lazy(() => import('./pages/ResetPassword'));
const AuthCallback = React.lazy(() => import('./pages/AuthCallback'));
const StatusPage = React.lazy(() => import('./pages/StatusPage'));

// Admin pages
const AdminLogin = React.lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
const AdminTransactions = React.lazy(() => import('./pages/admin/AdminTransactions'));
const AdminUsers = React.lazy(() => import('./pages/admin/AdminUsers'));
const AdminContacts = React.lazy(() => import('./pages/admin/AdminContacts'));
const AdminSettings = React.lazy(() => import('./pages/admin/AdminSettings'));
const AdminPromotions = React.lazy(() => import('./pages/admin/AdminPromotions'));
// Page transition variants
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    filter: 'blur(4px)',
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    filter: 'blur(4px)',
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

const PageTransition = ({ children }) => (
  <motion.div
    variants={pageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    style={{ width: '100%' }}
  >
    {children}
  </motion.div>
);

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />}>
        <Routes location={location} key={location.pathname}>
          {/* Landing Page - Accessible to everyone */}
          <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />

          {/* Public Routes - Redirect to dashboard if already logged in */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
            <Route path="/signup" element={<PageTransition><Signup /></PageTransition>} />
            <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
            <Route path="/reset-password/:token" element={<PageTransition><ResetPassword /></PageTransition>} />
          </Route>

          <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
          <Route path="/features" element={<PageTransition><Features /></PageTransition>} />
          <Route path="/pricing" element={<PageTransition><Pricing /></PageTransition>} />
          <Route path="/about" element={<PageTransition><About /></PageTransition>} />
          <Route path="/privacy" element={<PageTransition><Privacy /></PageTransition>} />
          <Route path="/terms" element={<PageTransition><TermsOfService /></PageTransition>} />

          <Route path="/auth/callback" element={<PageTransition><AuthCallback /></PageTransition>} />
          <Route path="/system-status" element={<PageTransition><StatusPage /></PageTransition>} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<PageTransition><AdminLogin /></PageTransition>} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<PageTransition><AdminDashboard /></PageTransition>} />
            <Route path="transactions" element={<PageTransition><AdminTransactions /></PageTransition>} />
            <Route path="users" element={<PageTransition><AdminUsers /></PageTransition>} />
            <Route path="contacts" element={<PageTransition><AdminContacts /></PageTransition>} />
            <Route path="promotions" element={<PageTransition><AdminPromotions /></PageTransition>} />
            <Route path="settings" element={<PageTransition><AdminSettings /></PageTransition>} />
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
              <Route path="dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
              <Route path="transactions" element={<PageTransition><Transactions /></PageTransition>} />
              <Route path="analytics" element={<PageTransition><Analytics /></PageTransition>} />
              <Route path="accounts" element={<PageTransition><Accounts /></PageTransition>} />
              <Route path="tracko-pulse">
                <Route index element={<PageTransition><PulseHub /></PageTransition>} />
                <Route path="chat" element={<PageTransition><AskTracko /></PageTransition>} />
                <Route path="analysis" element={<PageTransition><PulseAnalysisDashboard /></PageTransition>} />
              </Route>
              <Route path="settings" element={<PageTransition><Settings /></PageTransition>} />
              <Route path="billing" element={<PageTransition><Billing /></PageTransition>} />
            </Route>
          </Route>

          <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <GlobalProvider>
          <HelmetProvider>
            <Router>
              <AnimatedRoutes />
              <Toaster
                position="bottom-right"
                richColors
                closeButton
                toastOptions={{
                  style: {
                    fontFamily: 'inherit',
                    fontWeight: 700,
                    borderRadius: '12px',
                    border: '2px solid #1a1a1a',
                    boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
                  },
                }}
              />
            </Router>
          </HelmetProvider>
        </GlobalProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
