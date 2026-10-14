// src/components/NotFound.js
import React from 'react';
import { Link } from 'react-router-dom';
import Error from './Assets/404error.gif'

const NotFound = () => {
  const isAuthenticated = !!localStorage.getItem('authToken');
  const redirectPath = isAuthenticated ? '/chat' : '/';

  return (
    <div style={styles.container}>
      <img className="roboatimg" src={Error} alt="robot" />
      <p style={styles.message}>Oops! The page you're looking for doesn't exist.</p>
      <Link to={redirectPath} style={styles.link}>
        {isAuthenticated ? 'Go to Dashboard' : 'Go Home'}
      </Link>
    </div>
  );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        height: '100vh',
        background: '#ffffff',
        padding: '0 1rem',
      },
      
  title: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  message: {
    fontSize: '1.5rem',
    marginBottom: '2rem',
  },
  link: {
    padding: '0.5rem 1.5rem',
    backgroundColor: '#ffd24d',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '8px',
    fontWeight: '500',
  },
};

export default NotFound;
