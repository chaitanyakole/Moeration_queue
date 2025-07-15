import React, { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import store from './store';
import ModerationQueue from './components/ModerationQueue';
import Toast from './components/Toast';
import './App.css';

function App() {
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success', action = null) => {
    setToast({ message, type, action });
  };

  const hideToast = () => {
    setToast(null);
  };

  return (
    <Provider store={store}>
      <div className="App">
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-4">
                <h1 className="text-2xl font-bold text-gray-900">Content Moderation Queue</h1>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">Moderator Dashboard</span>
                </div>
              </div>
            </div>
          </header>
          
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <ModerationQueue showToast={showToast} />
          </main>
        </div>
        
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            action={toast.action}
            onClose={hideToast}
          />
        )}
      </div>
    </Provider>
  );
}

export default App;