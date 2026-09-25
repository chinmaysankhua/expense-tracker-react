import { useState } from "react";

const PasswordInput = ({
  placeholder,
  value,
  onChange,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="password-input-wrapper">

      <input
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />

      <button
        type="button"
        className="password-toggle"
        onClick={() => setShowPassword((prev) => !prev)}
        aria-label={
          showPassword
            ? "Hide password"
            : "Show password"
        }
      >
        {showPassword ? "🙈" : "👁️"}
      </button>

    </div>
  );
};

export default PasswordInput;