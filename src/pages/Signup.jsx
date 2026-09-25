import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";

import { auth } from "../firebase/firebase";

const Signup = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (event) => {
    event.preventDefault();

    setError("");

    // 1. Check fields
    if (!email || !password || !confirmPassword) {
      setError("Please fill all fields");
      return;
    }

    // 2. Check password match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // 3. Firebase requires at least 6 characters
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      // 4. Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      console.log("User created:", userCredential.user);

      // 5. Go to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.log(error);

      if (error.code === "auth/email-already-in-use") {
        setError("This email is already registered");
      } else if (error.code === "auth/invalid-email") {
        setError("Please enter a valid email");
      } else if (error.code === "auth/weak-password") {
        setError("Password is too weak");
      } else {
        setError("Something went wrong. Please try again");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="signup-card">

        <h1>SignUp</h1>

        <form onSubmit={handleSignup}>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(event) =>
              setConfirmPassword(event.target.value)
            }
          />

          {error && (
            <p className="error-message">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Sign up"}
          </button>

        </form>

      </div>

      <div className="login-box">
        Have an account?{" "}
        <Link to="/login">
          Login
        </Link>
      </div>
    </div>
  );
};

export default Signup;