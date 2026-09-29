import { useEffect } from "react";

import { onAuthStateChanged } from "firebase/auth";

import { useDispatch } from "react-redux";

import { auth } from "../firebase/firebase";

import { login, logout } from "../redux/authSlice";

const AuthSync = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const idToken = await user.getIdToken();

          dispatch(
            login({
              userId: user.uid,
              email: user.email,
              idToken: idToken,
              emailVerified: user.emailVerified,
            }),
          );
        } catch (error) {
          console.error("Unable to get ID token:", error);

          dispatch(logout());
        }
      } else {
        dispatch(logout());
      }
    });

    return unsubscribe;
  }, [dispatch]);

  return null;
};

export default AuthSync;
