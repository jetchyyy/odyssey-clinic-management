import React, { useContext, useState, useEffect } from "react";
import PropTypes from "prop-types"; 
import { auth, database } from "../../firebase/firebase"; 
import { onAuthStateChanged } from "firebase/auth";
import { ref, get } from "firebase/database"; 

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

// Loading Component
const LoadingScreen = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        {/* Spinning border around logo */}
        <div style={{
          position: 'absolute',
          width: '120px',
          height: '120px',
          border: '4px solid #e0e0e0',
          borderTop: '4px solid #10b981',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        {/* Logo */}
        <img 
          src="/logo.jpg" 
          alt="Odyssey Logo" 
          style={{
            width: '80px',
            height: '80px',
            objectFit: 'contain',
            zIndex: 1
          }}
        />
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <p style={{
        marginTop: '30px',
        fontSize: '16px',
        color: '#666',
        fontWeight: '500'
      }}>
        Loading
      </p>
    </div>
  );
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [isEmailUser, setIsEmailUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);  
  const [department, setDepartment] = useState(null);  

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, initializeUser);
    return unsubscribe;
  }, []);

  async function initializeUser(user) {
    if (user) {
      setCurrentUser({ ...user });

      const isEmail = user.providerData.some(
        (provider) => provider.providerId === "password"
      );
      setIsEmailUser(isEmail);

      setUserLoggedIn(true);

      const userRef = ref(database, `users/${user.uid}`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        const userData = snapshot.val();
        setRole(userData.role);  
        setDepartment(userData.department);  
      } else {
        console.log("No user data found in Realtime Database");
      }
    } else {
      setCurrentUser(null);
      setUserLoggedIn(false);
      setRole(null);  
      setDepartment(null);  
    }

    setLoading(false);
  }

  const value = {
    userLoggedIn,
    isEmailUser,
    currentUser,
    role,  
    department,  
    setCurrentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? <LoadingScreen /> : children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired, 
};