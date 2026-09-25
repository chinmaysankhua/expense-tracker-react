import { useEffect, useState } from "react";
import { ref, get, set } from "firebase/database";
import { useNavigate } from "react-router-dom";
import { updateProfile } from "firebase/auth";

import { auth, database } from "../firebase/firebase";
import { useAuth } from "../context/AuthContext";
import "./Profile.css"
const Profile = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [photoURL, setPhotoURL] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
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

          setFullName(profile.fullName || "");
          setPhotoURL(profile.photoURL || "");
        }
      } catch (error) {
        console.error(error);
        setError("Unable to load profile");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [currentUser]);

  const handleUpdate = async (event) => {
    event.preventDefault();

    setError("");

    if (!fullName.trim()) {
      setError("Please enter your full name");
      return;
    }

    if (!photoURL.trim()) {
      setError("Please enter your profile photo URL");
      return;
    }

    try {
      setSaving(true);

      const profileRef = ref(
        database,
        `users/${currentUser.uid}/profile`
      );

      await set(profileRef, {
        fullName: fullName.trim(),
        photoURL: photoURL.trim(),
      });

      // Also update Firebase Authentication profile
      await updateProfile(auth.currentUser, {
        displayName: fullName.trim(),
        photoURL: photoURL.trim(),
      });

      navigate("/dashboard");

    } catch (error) {
      console.error(error);
      setError("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p>Loading profile...</p>;
  }

  return (
    <div className="profile-page">

      <div className="profile-header">

        <h2>Contact Details</h2>

        <button
          type="button"
          className="cancel-button"
          onClick={() => navigate("/dashboard")}
        >
          Cancel
        </button>

      </div>

      <form
        className="profile-form"
        onSubmit={handleUpdate}
      >

        <div className="profile-field">

          <span className="profile-icon">
            ◉
          </span>

          <label>
            Full Name:
          </label>

          <input
            type="text"
            value={fullName}
            onChange={(event) =>
              setFullName(event.target.value)
            }
          />

        </div>

        <div className="profile-field">

          <span className="profile-icon">
            ◉
          </span>

          <label>
            Profile Photo URL
          </label>

          <input
            type="url"
            value={photoURL}
            onChange={(event) =>
              setPhotoURL(event.target.value)
            }
          />

        </div>

        {error && (
          <p className="error-message">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="update-button"
          disabled={saving}
        >
          {saving ? "Updating..." : "Update"}
        </button>

      </form>

    </div>
  );
};

export default Profile;