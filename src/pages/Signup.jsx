import { useState } from "react";

import { createUserWithEmailAndPassword } from "firebase/auth";

import { useNavigate, Link } from "react-router-dom";

import { useDispatch } from "react-redux";

import { auth } from "../firebase/firebase";

import { login } from "../redux/authSlice";

import PasswordInput from "../components/PasswordInput";

import "./Signup.css";

const Signup = () => {
  const navigate = useNavigate();

  const dispatch = useDispatch();

  // ==========================================
  // FORM STATE
  // ==========================================

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  // ==========================================
  // SIGNUP
  // ==========================================

  const handleSignup = async (e) => {
    e.preventDefault();

    setError("");

    // -----------------------------
    // Validation
    // -----------------------------

    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields.");

      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");

      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");

      return;
    }

    try {
      setLoading(true);

      // -----------------------------
      // Create Firebase User
      // -----------------------------

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      const user = userCredential.user;

      // -----------------------------
      // Get Firebase ID Token
      // -----------------------------

      const idToken = await user.getIdToken();

      // -----------------------------
      // Store Auth State in Redux
      // -----------------------------

      dispatch(
        login({
          userId: user.uid,

          email: user.email,

          idToken: idToken,

          emailVerified: user.emailVerified,
        }),
      );

      // -----------------------------
      // Redirect
      // -----------------------------

      navigate("/dashboard");
    } catch (error) {
      console.error("Signup error:", error);

      // -----------------------------
      // Firebase Errors
      // -----------------------------

      switch (error.code) {
        case "auth/email-already-in-use":
          setError("An account already exists with this email.");

          break;

        case "auth/invalid-email":
          setError("Please enter a valid email address.");

          break;

        case "auth/weak-password":
          setError("Password is too weak.");

          break;

        case "auth/operation-not-allowed":
          setError("Email/password authentication is not enabled.");

          break;

        case "auth/network-request-failed":
          setError("Network error. Please check your internet connection.");

          break;

        default:
          setError("Unable to create account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="signup-page">
      <div className="signup-card">
        <h2>Create Account</h2>

        <form onSubmit={handleSignup}>
          {/* EMAIL */}

          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* PASSWORD */}

          <PasswordInput
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* CONFIRM PASSWORD */}

          <PasswordInput
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          {/* SUBMIT */}

          <button type="submit" disabled={loading}>
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        {/* ERROR */}

        {error && <p className="error-message">{error}</p>}

        {/* LOGIN LINK */}

        <p className="login-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
