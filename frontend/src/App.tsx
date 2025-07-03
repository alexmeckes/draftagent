import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import SimpleLoginPage from './SimpleLoginPage';
import DraftsPage from './pages/DraftsPage';
import DraftRoomPage from './pages/DraftRoomPage';

console.log('App.tsx file loaded');

// Simple protected route component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const hasUserId = localStorage.getItem('userId');
  return hasUserId ? <>{children}</> : <Navigate to="/" replace />;
}

function App() {
  console.log('App component is rendering');
  
  // Add dark class to html element for dark mode
  React.useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);
  
  return (
    <Provider store={store}>
      <Router>
        <div className="min-h-screen bg-dark-bg">
          <Routes>
            <Route path="/" element={<SimpleLoginPage />} />
            <Route 
              path="/drafts" 
              element={
                <ProtectedRoute>
                  <DraftsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/draft/:draftId" 
              element={
                <ProtectedRoute>
                  <DraftRoomPage />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </Provider>
  );
}

export default App;
