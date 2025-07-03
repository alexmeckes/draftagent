import { useNavigate } from 'react-router-dom';

export default function SimpleDraftsPage() {
  const navigate = useNavigate();
  
  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#111827',
      padding: '2rem',
      color: '#f9fafb'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem'
    },
    title: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#9333EA'
    },
    button: {
      padding: '0.5rem 1rem',
      backgroundColor: '#374151',
      color: 'white',
      border: 'none',
      borderRadius: '0.5rem',
      cursor: 'pointer'
    },
    card: {
      backgroundColor: '#1F2937',
      padding: '2rem',
      borderRadius: '0.5rem',
      textAlign: 'center' as const
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('userId');
    navigate('/');
  };
  
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Your Drafts</h1>
        <button onClick={handleLogout} style={styles.button}>
          Logout
        </button>
      </div>
      
      <div style={styles.card}>
        <h2>Welcome to the Drafts Page!</h2>
        <p style={{ marginTop: '1rem', color: '#9CA3AF' }}>
          Your drafts will appear here once the backend is connected.
        </p>
      </div>
    </div>
  );
} 