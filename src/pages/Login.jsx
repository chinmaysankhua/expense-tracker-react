import { useState } from "react";
import {
  signInWithEmailAndPassword,
} from "firebase/auth";
import PasswordInput from "../components/PasswordInput";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import { auth } from "../firebase/firebase";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

      console.log("Logged in user:", userCredential.user);

      navigate("/dashboard");

    } catch (error) {
      console.log(error);

      if (error.code === "auth/invalid-credential") {
        setError("Invalid email or password");
      } else if (error.code === "auth/user-not-found") {
        setError("User not found");
      } else if (error.code === "auth/wrong-password") {
        setError("Wrong password");
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <div className="signup-card">

        <h1>Login</h1>

        <form onSubmit={handleLogin}>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
          />

          <PasswordInput
  placeholder="Password"
  value={password}
  onChange={(event) =>
    setPassword(event.target.value)
  }
/>

          {error && (
            <p className="error-message">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

      </div>

      <div className="login-box">

        Don't have an account?{" "}

        <Link to="/signup">
          Sign up
        </Link>

      </div>

    </div>
  );
};

export default Login;