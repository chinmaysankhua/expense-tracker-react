import { useEffect, useState } from "react";

import { signOut } from "firebase/auth";

import { ref, get, push, onValue, remove, update } from "firebase/database";

import { Link, useNavigate } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";

import { auth, database } from "../firebase/firebase";

import { logout, updateEmailVerified } from "../redux/authSlice";

import {
  setExpenses,
  addExpense,
  deleteExpense,
  updateExpense,
} from "../redux/expenseSlice";

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
    (total, expense) => total + Number(expense.amount),
    0,
  );

  // ==========================================
  // PROFILE
  // ==========================================

  useEffect(() => {
    const checkProfile = async () => {
      if (!userId) {
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
  // ==========================================

  useEffect(() => {
    if (!userId) {
      return;
    }

    const expensesRef = ref(database, `users/${userId}/expenses`);

    const unsubscribe = onValue(expensesRef, (snapshot) => {
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
        .sort((a, b) => b.createdAt - a.createdAt);

      dispatch(setExpenses(expensesArray));
    });

    return () => unsubscribe();
  }, [userId, dispatch]);

  // ==========================================
  // ADD EXPENSE
  // ==========================================

  const handleAddExpense = async (e) => {
    e.preventDefault();

    setExpenseError("");

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

      const newExpense = {
        amount: Number(amount),

        description: description.trim(),

        category,

        createdAt: Date.now(),
      };

      const newExpenseRef = await push(expensesRef, newExpense);

      // Update Redux immediately

      dispatch(
        addExpense({
          id: newExpenseRef.key,

          ...newExpense,
        }),
      );

      setAmount("");

      setDescription("");

      setCategory("");
    } catch (error) {
      console.error("Error adding expense:", error);

      setExpenseError("Unable to add expense.");
    } finally {
      setAddingExpense(false);
    }
  };

  // ==========================================
  // DELETE EXPENSE
  // ==========================================

  const handleDeleteExpense = async (expenseId) => {
    try {
      const expenseRef = ref(database, `users/${userId}/expenses/${expenseId}`);

      await remove(expenseRef);

      dispatch(deleteExpense(expenseId));

      console.log("Expense successfuly deleted");
    } catch (error) {
      console.error("Error deleting expense:", error);
    }
  };

  // ==========================================
  // EDIT
  // ==========================================

  const handleEditExpense = (expense) => {
    setEditingExpenseId(expense.id);

    setEditAmount(expense.amount);

    setEditDescription(expense.description);

    setEditCategory(expense.category);

    setEditError("");
  };

  // ==========================================
  // UPDATE
  // ==========================================

  const handleUpdateExpense = async (e) => {
    e.preventDefault();

    setEditError("");

    if (!editAmount || !editDescription.trim() || !editCategory) {
      setEditError("Please fill in all expense fields.");

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

      await update(expenseRef, updatedExpense);

      dispatch(
        updateExpense({
          id: editingExpenseId,

          ...expenses.find((expense) => expense.id === editingExpenseId),

          ...updatedExpense,
        }),
      );

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
  // UI
  // ==========================================

  return (
    <div className="dashboard">
      {/* HEADER */}

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

      {/* EMAIL VERIFICATION */}

      {!emailVerified && (
        <EmailVerification
          user={auth.currentUser}
          onVerified={() => dispatch(updateEmailVerified(true))}
        />
      )}

      {/* CONTENT */}

      <main className="dashboard-content">
        <h2>Daily Expenses</h2>

        {/* TOTAL */}

        <div className="expense-summary">
          <h3>Total Expenses</h3>

          <p>₹{totalExpense}</p>
        </div>

        {/* PREMIUM */}

        {totalExpense > 10000 && (
          <button
            className="premium-button"
            onClick={() => console.log("Premium activated")}
          >
            Activate Premium
          </button>
        )}

        {/* ADD FORM */}

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
            />
          </div>

          <div className="expense-field">
            <label>Description</label>

            <input
              type="text"
              placeholder="Enter description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="expense-field">
            <label>Category</label>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
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

        {/* EDIT FORM */}

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
                />
              </div>

              <div className="expense-field">
                <label>Description</label>

                <input
                  type="text"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
              </div>

              <div className="expense-field">
                <label>Category</label>

                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
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
                onClick={() => setEditingExpenseId(null)}
              >
                Cancel
              </button>
            </form>

            {editError && <p className="expense-error">{editError}</p>}
          </div>
        )}

        {/* EXPENSE LIST */}

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
                      {new Date(expense.createdAt).toLocaleString()}
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
