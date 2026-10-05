import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Calculator from './pages/Calculator';
import Login from './pages/Login';
import Register from './pages/Register';
import History from './pages/History';
import Pricing from './pages/Pricing';
import SubscriptionSuccess from './pages/SubscriptionSuccess';
import Reports from './pages/Reports';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-midnight">
          <Header />
          <Routes>
            <Route path="/" element={<Calculator />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/history" element={<History />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/subscription/success" element={<SubscriptionSuccess />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
