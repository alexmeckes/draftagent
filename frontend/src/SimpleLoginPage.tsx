import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { AppDispatch } from './store';
import { connectSleeper } from './store/authSlice';

export default function SimpleLoginPage() {
  console.log('SimpleLoginPage rendering');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', username);
    
    if (!username.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await dispatch(connectSleeper(username)).unwrap();
      navigate('/drafts');
    } catch (err: any) {
      setError(err.message || 'Failed to connect to Sleeper');
    } finally {
      setIsLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#111827',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    },
    card: {
      backgroundColor: '#1F2937',
      padding: '2rem',
      borderRadius: '0.5rem',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      maxWidth: '28rem',
      width: '100%'
    },
    title: {
      fontSize: '2.25rem',
      fontWeight: 'bold',
      color: '#9333EA',
      marginBottom: '0.5rem',
      textAlign: 'center' as const
    },
    input: {
      width: '100%',
      padding: '0.5rem 1rem',
      backgroundColor: '#374151',
      border: '1px solid #4B5563',
      borderRadius: '0.5rem',
      color: '#f9fafb',
      fontSize: '1rem',
      outline: 'none'
    },
    button: {
      width: '100%',
      padding: '0.75rem 1rem',
      backgroundColor: isLoading || !username.trim() ? '#374151' : '#9333EA',
      color: 'white',
      fontWeight: '600',
      borderRadius: '0.5rem',
      border: 'none',
      cursor: isLoading || !username.trim() ? 'not-allowed' : 'pointer',
      fontSize: '1rem'
    },
    error: {
      backgroundColor: 'rgba(239, 68, 68, 0.2)',
      color: '#EF4444',
      padding: '0.75rem',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      marginBottom: '1rem'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>
          AI Fantasy Draft Assistant
        </h1>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your Sleeper username"
              style={styles.input}
              disabled={isLoading}
            />
          </div>
          
          {error && (
            <div style={styles.error}>
              <p>{error}</p>
            </div>
          )}
          
          <button 
            type="submit" 
            style={styles.button}
            disabled={isLoading || !username.trim()}
          >
            {isLoading ? 'Connecting...' : 'Connect with Sleeper'}
          </button>
        </form>
      </div>
    </div>
  );
} 