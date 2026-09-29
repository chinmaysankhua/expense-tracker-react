import { useEffect, useState } from "react";

import { signOut } from "firebase/auth";

import {
  ref,
  get,
  push,
  set,
  onValue,
  remove,
  update,
} from "firebase/database";

import { Link, useNavigate } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";

import { auth, database } from "../firebase/firebase";

import { logout, updateEmailVerified } from "../redux/authSlice";

import { setExpenses } from "../redux/expenseSlice";

import {
  activatePremium,
  enableDarkMode,
  toggleTheme,
  setPremiumStatus,
  setTheme,
} from "../redux/themeSlice";

import EmailVerification from "../components/EmailVerification";

import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ==========================================
  // AUTH REDUX
  // ==========================================

  const userId = useSelector((state) => state.auth.userId);

  const email = useSelector((state) => state.auth.email);

  const emailVerified = useSelector((state) => state.auth.emailVerified);

  // ==========================================
  // THEME / PREMIUM REDUX
  // ==========================================

  const isDarkMode = useSelector((state) => state.theme.isDarkMode);

  const premiumActivated = useSelector((state) => state.theme.premiumActivated);

  // ==========================================
  // EXPENSE REDUX
  // ==========================================

  const expenses = useSelector((state) => state.expenses.expenses);

  // ==========================================
  // LOCAL FORM STATE
  // ==========================================

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");

  const [expenseError, setExpenseError] = useState("");
  const [addingExpense, setAddingExpense] = useState(false);

  // ==========================================
  // EDIT STATE
  // ==========================================

  const [editingExpenseId, setEditingExpenseId] = useState(null);

  const [editAmount, setEditAmount] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("");

  const [editError, setEditError] = useState("");
  const [updatingExpense, setUpdatingExpense] = useState(false);

  // ==========================================
  // PROFILE STATE
  // ==========================================

  const [profileComplete, setProfileComplete] = useState(false);

  const [loadingProfile, setLoadingProfile] = useState(true);

  // ==========================================
  // TOTAL EXPENSE
  // ==========================================

  const totalExpense = expenses.reduce(
    (total, expense) => total + Number(expense.amount || 0),
    0,
  );

  // ==========================================
  // LOAD PROFILE
  // ==========================================

  useEffect(() => {
    const checkProfile = async () => {
      if (!userId) {
        setLoadingProfile(false);
        return;
      }

      try {
        const profileRef = ref(database, `users/${userId}/profile`);

        const snapshot = await get(profileRef);

        if (snapshot.exists()) {
          const profile = snapshot.val();

          setProfileComplete(
            Boolean(profile.fullName) && Boolean(profile.photoURL),
          );
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
  }, [userId]);

  // ==========================================
  // LOAD EXPENSES INTO REDUX
  // FIREBASE IS THE SINGLE SOURCE OF TRUTH
  // ==========================================

  useEffect(() => {
    if (!userId) {
      dispatch(setExpenses([]));
      return;
    }

    const expensesRef = ref(database, `users/${userId}/expenses`);

    const unsubscribe = onValue(
      expensesRef,
      (snapshot) => {
        const data = snapshot.val();

        if (!data) {
          dispatch(setExpenses([]));
          return;
        }

        const expensesArray = Object.entries(data)
          .map(([id, expense]) => ({
            id,
            ...expense,
          }))
          .sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));

        dispatch(setExpenses(expensesArray));
      },
      (error) => {
        console.error("Error loading expenses:", error);

        setExpenseError("Unable to load expenses.");
      },
    );

    return () => unsubscribe();
  }, [userId, dispatch]);

  // ==========================================
  // LOAD PREMIUM / THEME SETTINGS
  // ==========================================

  useEffect(() => {
    if (!userId) {
      return;
    }

    const loadSettings = async () => {
      try {
        const settingsRef = ref(database, `users/${userId}/settings`);

        const snapshot = await get(settingsRef);

        if (snapshot.exists()) {
          const settings = snapshot.val();

          dispatch(setPremiumStatus(Boolean(settings.premiumActivated)));

          dispatch(setTheme(Boolean(settings.darkMode)));
        } else {
          // No settings saved yet
          dispatch(setPremiumStatus(false));
          dispatch(setTheme(false));
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    };

    loadSettings();
  }, [userId, dispatch]);
  // ==========================================
  // ADD EXPENSE
  // ==========================================

  const handleAddExpense = async (e) => {
    e.preventDefault();

    setExpenseError("");

    if (!userId) {
      setExpenseError("User session not found. Please login again.");
      return;
    }

    if (!amount || !description.trim() || !category) {
      setExpenseError("Please fill in all expense fields.");
      return;
    }

    if (Number(amount) <= 0) {
      setExpenseError("Amount must be greater than 0.");
      return;
    }

    try {
      setAddingExpense(true);

      const expensesRef = ref(database, `users/${userId}/expenses`);

      // Generate a unique Firebase key
      const newExpenseRef = push(expensesRef);

      // Save ONLY to Firebase
      await set(newExpenseRef, {
        amount: Number(amount),
        description: description.trim(),
        category,
        createdAt: Date.now(),
      });

      /*
        IMPORTANT:

        We DO NOT dispatch addExpense() here.

        Firebase -> onValue() -> setExpenses()
        will automatically update Redux.
      */

      setAmount("");
      setDescription("");
      setCategory("");

      console.log("Expense successfully added");
    } catch (error) {
      console.error("Error adding expense:", error);

      setExpenseError("Unable to add expense. Please try again.");
    } finally {
      setAddingExpense(false);
    }
  };

  // ==========================================
  // DELETE EXPENSE
  // ==========================================

  const handleDeleteExpense = async (expenseId) => {
    try {
      if (!userId) {
        return;
      }

      const expenseRef = ref(database, `users/${userId}/expenses/${expenseId}`);

      // Delete ONLY from Firebase
      await remove(expenseRef);

      /*
        DO NOT dispatch deleteExpense().

        onValue() will detect the deletion
        and update Redux automatically.
      */

      console.log("Expense successfuly deleted");
    } catch (error) {
      console.error("Error deleting expense:", error);
    }
  };

  // ==========================================
  // START EDIT
  // ==========================================

  const handleEditExpense = (expense) => {
    setEditingExpenseId(expense.id);

    setEditAmount(expense.amount);
    setEditDescription(expense.description);
    setEditCategory(expense.category);

    setEditError("");
  };

  // ==========================================
  // UPDATE EXPENSE
  // ==========================================

  const handleUpdateExpense = async (e) => {
    e.preventDefault();

    setEditError("");

    if (!editAmount || !editDescription.trim() || !editCategory) {
      setEditError("Please fill in all expense fields.");
      return;
    }

    if (Number(editAmount) <= 0) {
      setEditError("Amount must be greater than 0.");
      return;
    }

    if (!userId || !editingExpenseId) {
      setEditError("Unable to update this expense.");
      return;
    }

    try {
      setUpdatingExpense(true);

      const expenseRef = ref(
        database,
        `users/${userId}/expenses/${editingExpenseId}`,
      );

      const updatedExpense = {
        amount: Number(editAmount),
        description: editDescription.trim(),
        category: editCategory,
      };

      // Update ONLY Firebase
      await update(expenseRef, updatedExpense);

      /*
        DO NOT dispatch updateExpense().

        onValue() will detect the update
        and update Redux automatically.
      */

      setEditingExpenseId(null);
      setEditAmount("");
      setEditDescription("");
      setEditCategory("");

      console.log("Expense successfully updated");
    } catch (error) {
      console.error("Error updating expense:", error);

      setEditError("Unable to update expense.");
    } finally {
      setUpdatingExpense(false);
    }
  };

  // ==========================================
  // CANCEL EDIT
  // ==========================================

  const handleCancelEdit = () => {
    setEditingExpenseId(null);

    setEditAmount("");
    setEditDescription("");
    setEditCategory("");
    setEditError("");
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = async () => {
    try {
      await signOut(auth);

      dispatch(logout());

      localStorage.removeItem("idToken");

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // ==========================================
  // DOWNLOAD CSV
  // ==========================================

  const handleDownloadCSV = () => {
    if (expenses.length === 0) {
      alert("No expenses available to download.");
      return;
    }

    const headers = ["Amount", "Description", "Category", "Created At"];

    const rows = expenses.map((expense) => [
      expense.amount,
      expense.description,
      expense.category,
      expense.createdAt ? new Date(expense.createdAt).toLocaleString() : "",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "my-expenses.csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // ==========================================
  // ACTIVATE PREMIUM
  // ==========================================

  const handleActivatePremium = async () => {
    if (!userId) {
      return;
    }

    try {
      const settingsRef = ref(database, `users/${userId}/settings`);

      await update(settingsRef, {
        premiumActivated: true,
        darkMode: true,
      });

      dispatch(activatePremium());
      dispatch(enableDarkMode());

      console.log("Premium activated");
    } catch (error) {
      console.error("Error activating premium:", error);
    }
  };
  const handleToggleTheme = async () => {
    if (!userId) {
      return;
    }

    const newDarkMode = !isDarkMode;

    try {
      const settingsRef = ref(database, `users/${userId}/settings`);

      await update(settingsRef, {
        darkMode: newDarkMode,
      });

      dispatch(toggleTheme());
    } catch (error) {
      console.error("Error updating theme:", error);
    }
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className={`dashboard ${isDarkMode ? "dark-theme" : ""}`}>
      {/* ======================================
          HEADER
      ======================================= */}

      <header className="dashboard-header">
        <p>Welcome to Expense Tracker!!!</p>

        <div className="dashboard-actions">
          {!loadingProfile && !profileComplete && (
            <div className="profile-warning">
              <span>Your profile is incomplete.</span>

              <Link to="/profile">Complete now</Link>
            </div>
          )}

          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* ======================================
          EMAIL VERIFICATION
      ======================================= */}

      {!emailVerified && auth.currentUser && (
        <EmailVerification
          user={auth.currentUser}
          onVerified={() => dispatch(updateEmailVerified(true))}
        />
      )}

      {/* ======================================
          MAIN CONTENT
      ======================================= */}

      <main className="dashboard-content">
        <h2>Daily Expenses</h2>

        {/* ====================================
            TOTAL EXPENSE
        ===================================== */}

        <div className="expense-summary">
          <h3>Total Expenses</h3>

          <p>₹{totalExpense}</p>
        </div>

        {/* ====================================
            PREMIUM BUTTON
        ===================================== */}

        {totalExpense >= 10000 && !premiumActivated && (
          <button className="premium-button" onClick={handleActivatePremium}>
            Activate Premium
          </button>
        )}

        {/* ====================================
            PREMIUM CONTROLS
        ===================================== */}

        {premiumActivated && (
          <div className="premium-controls">
            <button className="theme-toggle" onClick={handleToggleTheme}>
              {isDarkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
            </button>

            <button className="download-button" onClick={handleDownloadCSV}>
              Download File
            </button>
          </div>
        )}

        {/* ====================================
            ADD EXPENSE FORM
        ===================================== */}

        <form className="expense-form" onSubmit={handleAddExpense}>
          <div className="expense-field">
            <label>Amount</label>

            <input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
              disabled={addingExpense}
            />
          </div>

          <div className="expense-field">
            <label>Description</label>

            <input
              type="text"
              placeholder="Enter description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={addingExpense}
            />
          </div>

          <div className="expense-field">
            <label>Category</label>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={addingExpense}
            >
              <option value="">Select category</option>

              <option value="Food">Food</option>

              <option value="Petrol">Petrol</option>

              <option value="Salary">Salary</option>

              <option value="Shopping">Shopping</option>

              <option value="Travel">Travel</option>

              <option value="Bills">Bills</option>

              <option value="Other">Other</option>
            </select>
          </div>

          <button
            type="submit"
            className="add-expense-button"
            disabled={addingExpense}
          >
            {addingExpense ? "Adding..." : "Add Expense"}
          </button>
        </form>

        {expenseError && <p className="expense-error">{expenseError}</p>}

        {/* ====================================
            EDIT FORM
        ===================================== */}

        {editingExpenseId && (
          <div className="edit-expense-container">
            <h3>Edit Expense</h3>

            <form className="edit-expense-form" onSubmit={handleUpdateExpense}>
              <div className="expense-field">
                <label>Amount</label>

                <input
                  type="number"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  min="0"
                  step="0.01"
                  disabled={updatingExpense}
                />
              </div>

              <div className="expense-field">
                <label>Description</label>

                <input
                  type="text"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  disabled={updatingExpense}
                />
              </div>

              <div className="expense-field">
                <label>Category</label>

                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  disabled={updatingExpense}
                >
                  <option value="">Select category</option>

                  <option value="Food">Food</option>

                  <option value="Petrol">Petrol</option>

                  <option value="Salary">Salary</option>

                  <option value="Shopping">Shopping</option>

                  <option value="Travel">Travel</option>

                  <option value="Bills">Bills</option>

                  <option value="Other">Other</option>
                </select>
              </div>

              <button
                type="submit"
                className="submit-edit-button"
                disabled={updatingExpense}
              >
                {updatingExpense ? "Updating..." : "Submit"}
              </button>

              <button
                type="button"
                className="cancel-edit-button"
                onClick={handleCancelEdit}
                disabled={updatingExpense}
              >
                Cancel
              </button>
            </form>

            {editError && <p className="expense-error">{editError}</p>}
          </div>
        )}

        {/* ====================================
            EXPENSE LIST
        ===================================== */}

        <section className="expense-list">
          <h3>Your Expenses</h3>

          {expenses.length === 0 ? (
            <p className="no-expenses">No expenses added yet.</p>
          ) : (
            <div className="expenses-container">
              {expenses.map((expense) => (
                <div className="expense-card" key={expense.id}>
                  <div className="expense-details">
                    <h4>₹{expense.amount}</h4>

                    <p>{expense.description}</p>
                  </div>

                  <div className="expense-right">
                    <span className="expense-category">{expense.category}</span>

                    <small>
                      {expense.createdAt
                        ? new Date(expense.createdAt).toLocaleString()
                        : ""}
                    </small>

                    <div className="expense-actions">
                      <button
                        type="button"
                        className="edit-button"
                        onClick={() => handleEditExpense(expense)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="delete-button"
                        onClick={() => handleDeleteExpense(expense.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
