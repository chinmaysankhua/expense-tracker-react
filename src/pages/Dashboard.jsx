import { useEffect, useState } from "react";
import { ref, get } from "firebase/database";
import { signOut } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";

import { auth, database } from "../firebase/firebase";
import { useAuth } from "../context/AuthContext";
import "./Dashboard.css"
const Dashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [profileComplete, setProfileComplete] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    const checkProfile = async () => {
      if (!currentUser) {
        return;
      }

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
        console.error(
          "Profile check failed:",
          error
        );

        setProfileComplete(false);
      } finally {
        setLoadingProfile(false);
      }
    };

    checkProfile();
  }, [currentUser]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div className="dashboard">

      <header className="dashboard-header">

        <p>
          Welcome to Expense Tracker!!!
        </p>

        {!loadingProfile && !profileComplete && (
          <div className="profile-warning">

            <span>
              Your profile is incomplete.
            </span>

            <Link to="/profile">
              Complete now
            </Link>

          </div>
        )}

      </header>

      <main className="dashboard-content">

        <h1>Expense Tracker</h1>

        <p>
          Welcome,{" "}
          {currentUser?.displayName ||
            currentUser?.email}
        </p>

        <button onClick={handleLogout}>
          Logout
        </button>

      </main>

    </div>
  );
};

export default Dashboard;