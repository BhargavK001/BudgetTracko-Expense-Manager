import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { GlobalProvider } from './context/GlobalContext';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';

import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Contact from './pages/Contact';

function App() {
  return (
    <ThemeProvider>
      <GlobalProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/contact" element={<Contact />} />

            <Route path="/" element={<Layout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="transactions" element={<Transactions />} />
              {/* Add more routes here */}
            </Route>
          </Routes>
        </Router>
      </GlobalProvider>
    </ThemeProvider>
  );
}

export default App;
