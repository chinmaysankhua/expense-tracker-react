import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

import { auth } from "../firebase/firebase";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { currentUser } = useAuth();

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);

      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div>

      <h1>Expense Tracker</h1>

      <h2>
        Welcome 👋
      </h2>

      <p>
        Logged in as:
      </p>

      <p>
        {currentUser?.email}
      </p>

      <p>
        UID:
      </p>

      <p>
        {currentUser?.uid}
      </p>

      <button onClick={handleLogout}>
        Logout
      </button>

    </div>
  );
};

export default Dashboard;