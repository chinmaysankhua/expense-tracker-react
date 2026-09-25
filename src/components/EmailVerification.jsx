import { useState } from "react";
import {
  reload,
  sendEmailVerification,
} from "firebase/auth";

import "./EmailVerification.css";

const EmailVerification = ({
  user,
  onVerified,
}) => {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(false);

  const handleVerifyEmail = async () => {
    setMessage("");
    setError("");

    try {
      setSending(true);

      await sendEmailVerification(user);

      setMessage(
        "Verification email sent. Please check your inbox."
      );

    } catch (error) {
      console.error(error);

      switch (error.code) {
        case "auth/too-many-requests":
          setError(
            "Too many requests. Please wait before trying again."
          );
          break;

        case "auth/user-token-expired":
        case "auth/invalid-user-token":
          setError(
            "Your session has expired. Please login again."
          );
          break;

        case "auth/user-disabled":
          setError(
            "This account has been disabled."
          );
          break;

        case "auth/network-request-failed":
          setError(
            "Network error. Please check your internet connection."
          );
          break;

        default:
          setError(
            "Unable to send verification email."
          );
      }

    } finally {
      setSending(false);
    }
  };

  const handleCheckVerification = async () => {
    setMessage("");
    setError("");

    try {
      setChecking(true);

      await reload(user);

      if (user.emailVerified) {
        setMessage(
          "Email verified successfully! 🎉"
        );

        onVerified();

      } else {
        setError(
          "Your email is not verified yet. Please click the link in your email."
        );
      }

    } catch (error) {
      console.error(error);

      switch (error.code) {
        case "auth/user-token-expired":
        case "auth/invalid-user-token":
          setError(
            "Your session has expired. Please login again."
          );
          break;

        case "auth/user-disabled":
          setError(
            "This account has been disabled."
          );
          break;

        case "auth/network-request-failed":
          setError(
            "Network error. Please check your internet connection."
          );
          break;

        default:
          setError(
            "Unable to check verification status."
          );
      }

    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="email-verification">

      <h3>
        Verify your email
      </h3>

      <p>
        Your email address has not been verified.
      </p>

      <p>
        Check your email:
      </p>

      <strong>
        {user?.email}
      </strong>

      <button
        onClick={handleVerifyEmail}
        disabled={sending}
      >
        {sending
          ? "Sending..."
          : "Verify Email"}
      </button>

      <button
        onClick={handleCheckVerification}
        disabled={checking}
      >
        {checking
          ? "Checking..."
          : "I've verified my email"}
      </button>

      {message && (
        <p className="success-message">
          {message}
        </p>
      )}

      {error && (
        <p className="error-message">
          {error}
        </p>
      )}

    </div>
  );
};

export default EmailVerification;