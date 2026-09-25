import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";

import { auth, database } from "../firebase/firebase";
import { useAuth } from "../context/AuthContext";

import EmailVerification from "../components/EmailVerification";

import { ref, get } from "firebase/database";

import "./Dashboard.css";

const Dashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [profileComplete, setProfileComplete] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [emailVerified, setEmailVerified] = useState(
    currentUser?.emailVerified || false
  );

  useEffect(() => {
    const checkProfile = async () => {
      if (!currentUser) return;

      try {
        const profileRef = ref(
          database,
          `users/${currentUser.uid}/profile`
        );

        const snapshot = await get(profileRef);

        if (snapshot.exists()) {
          const profile = snapshot.val();

          const complete =
            Boolean(profile.fullName) &&
            Boolean(profile.photoURL);

          setProfileComplete(complete);
        } else {
          setProfileComplete(false);
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoadingProfile(false);
      }
    };

    checkProfile();
  }, [currentUser]);

  // Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);

      // Clear your manually stored ID token
      localStorage.removeItem("idToken");

      // Redirect to login
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="dashboard">

      {/* Header */}
      <header className="dashboard-header">

        <p>Welcome to Expense Tracker!!!</p>

        <div className="dashboard-actions">

          {!loadingProfile && !profileComplete && (
            <div className="profile-warning">
              <span>Your profile is incomplete.</span>
              <Link to="/profile">Complete now</Link>
            </div>
          )}

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </header>

      {/* Email Verification */}
      {!emailVerified && (
        <EmailVerification
          user={currentUser}
          onVerified={() => setEmailVerified(true)}
        />
      )}

      {/* Dashboard content */}
      <main className="dashboard-content">
        <h2>Dashboard</h2>
      </main>

    </div>
  );
};

export default Dashboard;