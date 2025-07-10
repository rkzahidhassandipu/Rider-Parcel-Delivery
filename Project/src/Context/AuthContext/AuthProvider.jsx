import React, { useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { auth } from '../../firebase/firebase.init';

let token = null;
export const getToken = () => token

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);



  const createUser = (email, password) => {
    setLoading(true);
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const signInUser = (email, password) => {
    setLoading(true);
    return signInWithEmailAndPassword(auth, email, password);
  };

  const updateUserProfile = profileInfo => {
    return updateProfile(auth.currentUser, profileInfo)
  }

  const logOut = () => {
    setLoading(true);
    return signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if(currentUser){
        currentUser.getIdToken()
        .then(idToken => {
          token = idToken
        })
        .catch(err => {
          console.log(err)
        })

      }
      else{
        token = null
      }
    });
    return () => unsubscribe();
  }, []);

  const authInfo = {
    user,
    setUser,
    loading,
    setLoading,
    createUser,
    signInUser,
    logOut,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={{ authInfo }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
