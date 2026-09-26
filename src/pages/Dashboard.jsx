import { useEffect, useState } from "react";

import { signOut } from "firebase/auth";

import { ref, get, push, onValue, remove, update } from "firebase/database";

import { Link, useNavigate } from "react-router-dom";

import { auth, database } from "../firebase/firebase";

import { useAuth } from "../context/AuthContext";

import EmailVerification from "../components/EmailVerification";

import "./Dashboard.css";

const Dashboard = () => {
  const { currentUser } = useAuth();

  const navigate = useNavigate();

  // ==========================================
  // PROFILE
  // ==========================================

  const [profileComplete, setProfileComplete] = useState(false);

  const [loadingProfile, setLoadingProfile] = useState(true);

  // ==========================================
  // EMAIL VERIFICATION
  // ==========================================

  const [emailVerified, setEmailVerified] = useState(
    currentUser?.emailVerified || false,
  );

  // ==========================================
  // ADD EXPENSE FORM
  // ==========================================

  const [amount, setAmount] = useState("");

  const [description, setDescription] = useState("");

  const [category, setCategory] = useState("");

  const [addingExpense, setAddingExpense] = useState(false);

  const [expenseError, setExpenseError] = useState("");

  // ==========================================
  // EXPENSES
  // ==========================================

  const [expenses, setExpenses] = useState([]);

  // ==========================================
  // EDIT EXPENSE
  // ==========================================

  const [editingExpenseId, setEditingExpenseId] = useState(null);

  const [editAmount, setEditAmount] = useState("");

  const [editDescription, setEditDescription] = useState("");

  const [editCategory, setEditCategory] = useState("");

  const [editError, setEditError] = useState("");

  const [updatingExpense, setUpdatingExpense] = useState(false);

  // ==========================================
  // CHECK PROFILE
  // ==========================================

  useEffect(() => {
    const checkProfile = async () => {
      if (!currentUser) {
        return;
      }

      try {
        const profileRef = ref(database, `users/${currentUser.uid}/profile`);

        const snapshot = await get(profileRef);

        if (snapshot.exists()) {
          const profile = snapshot.val();

          const complete =
            Boolean(profile.fullName) && Boolean(profile.photoURL);

          setProfileComplete(complete);
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
  }, [currentUser]);

  // ==========================================
  // LOAD EXPENSES
  // ==========================================

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    const expensesRef = ref(database, `users/${currentUser.uid}/expenses`);

    const unsubscribe = onValue(
      expensesRef,
      (snapshot) => {
        const data = snapshot.val();

        if (!data) {
          setExpenses([]);

          return;
        }

        const expensesArray = Object.entries(data).map(([id, expense]) => ({
          id,
          ...expense,
        }));

        // Newest first
        expensesArray.sort((a, b) => b.createdAt - a.createdAt);

        setExpenses(expensesArray);
      },
      (error) => {
        console.error("Error loading expenses:", error);
      },
    );

    // Cleanup listener
    return () => unsubscribe();
  }, [currentUser]);

  // ==========================================
  // ADD EXPENSE
  // ==========================================

  const handleAddExpense = async (e) => {
    e.preventDefault();

    setExpenseError("");

    // Validation

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

      const expensesRef = ref(database, `users/${currentUser.uid}/expenses`);

      await push(expensesRef, {
        amount: Number(amount),

        description: description.trim(),

        category,

        createdAt: Date.now(),
      });

      // Clear form

      setAmount("");

      setDescription("");

      setCategory("");
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
      const expenseRef = ref(
        database,
        `users/${currentUser.uid}/expenses/${expenseId}`,
      );

      await remove(expenseRef);

      console.log("Expense successfuly deleted");
    } catch (error) {
      console.error("Error deleting expense:", error);
    }
  };

  // ==========================================
  // START EDITING
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

    // Validation

    if (!editAmount || !editDescription.trim() || !editCategory) {
      setEditError("Please fill in all expense fields.");

      return;
    }

    if (Number(editAmount) <= 0) {
      setEditError("Amount must be greater than 0.");

      return;
    }

    try {
      setUpdatingExpense(true);

      const expenseRef = ref(
        database,
        `users/${currentUser.uid}/expenses/${editingExpenseId}`,
      );

      await update(expenseRef, {
        amount: Number(editAmount),

        description: editDescription.trim(),

        category: editCategory,
      });

      // Exit edit mode

      setEditingExpenseId(null);

      // Clear edit form

      setEditAmount("");

      setEditDescription("");

      setEditCategory("");

      console.log("Expense successfully updated");
    } catch (error) {
      console.error("Error updating expense:", error);

      setEditError("Unable to update expense. Please try again.");
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

      // Remove manually stored token
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
      {/* =====================================
          HEADER
      ====================================== */}

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

      {/* =====================================
          EMAIL VERIFICATION
      ====================================== */}

      {!emailVerified && (
        <EmailVerification
          user={currentUser}
          onVerified={() => setEmailVerified(true)}
        />
      )}

      {/* =====================================
          MAIN CONTENT
      ====================================== */}

      <main className="dashboard-content">
        <h2>Daily Expenses</h2>

        {/* ===================================
            ADD EXPENSE FORM
        ==================================== */}

        <form className="expense-form" onSubmit={handleAddExpense}>
          {/* Amount */}

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

          {/* Description */}

          <div className="expense-field">
            <label>Description</label>

            <input
              type="text"
              placeholder="Enter description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Category */}

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

          {/* Add Button */}

          <button
            type="submit"
            className="add-expense-button"
            disabled={addingExpense}
          >
            {addingExpense ? "Adding..." : "Add Expense"}
          </button>
        </form>

        {/* Add Expense Error */}

        {expenseError && <p className="expense-error">{expenseError}</p>}

        {/* ===================================
            EDIT EXPENSE FORM
        ==================================== */}

        {editingExpenseId && (
          <div className="edit-expense-container">
            <h3>Edit Expense</h3>

            <form className="edit-expense-form" onSubmit={handleUpdateExpense}>
              {/* Edit Amount */}

              <div className="expense-field">
                <label>Amount</label>

                <input
                  type="number"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Edit Description */}

              <div className="expense-field">
                <label>Description</label>

                <input
                  type="text"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
              </div>

              {/* Edit Category */}

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

              {/* Submit */}

              <button
                type="submit"
                className="submit-edit-button"
                disabled={updatingExpense}
              >
                {updatingExpense ? "Updating..." : "Submit"}
              </button>

              {/* Cancel */}

              <button
                type="button"
                className="cancel-edit-button"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
            </form>

            {/* Edit Error */}

            {editError && <p className="expense-error">{editError}</p>}
          </div>
        )}

        {/* ===================================
            EXPENSE LIST
        ==================================== */}

        <section className="expense-list">
          <h3>Your Expenses</h3>

          {expenses.length === 0 ? (
            <p className="no-expenses">No expenses added yet.</p>
          ) : (
            <div className="expenses-container">
              {expenses.map((expense) => (
                <div className="expense-card" key={expense.id}>
                  {/* Expense Details */}

                  <div className="expense-details">
                    <h4>₹{expense.amount}</h4>

                    <p>{expense.description}</p>
                  </div>

                  {/* Right Side */}

                  <div className="expense-right">
                    <span className="expense-category">{expense.category}</span>

                    <small>
                      {new Date(expense.createdAt).toLocaleString()}
                    </small>

                    {/* Buttons */}

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
