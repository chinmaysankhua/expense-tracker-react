import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import {
  ref,
  get,
  push,
  onValue,
} from "firebase/database";
import { Link, useNavigate } from "react-router-dom";

import { auth, database } from "../firebase/firebase";
import { useAuth } from "../context/AuthContext";

import EmailVerification from "../components/EmailVerification";

import "./Dashboard.css";

const Dashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Profile
  const [profileComplete, setProfileComplete] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Email verification
  const [emailVerified, setEmailVerified] = useState(
    currentUser?.emailVerified || false
  );

  // Expense form
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");

  const [addingExpense, setAddingExpense] = useState(false);
  const [expenseError, setExpenseError] = useState("");

  // Expenses
  const [expenses, setExpenses] = useState([]);

  // --------------------------------------------------
  // Check Profile
  // --------------------------------------------------

  useEffect(() => {
    const checkProfile = async () => {
      if (!currentUser) return;

      try {
        const profileRef = ref(
          database,
          `users/${currentUser.uid}/profile`
        );

        const snapshot = await get(profileRef);

        if (snapshot.exists()) {
          const profile = snapshot.val();

          const complete =
            Boolean(profile.fullName) &&
            Boolean(profile.photoURL);

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

  // --------------------------------------------------
  // Get Expenses
  // --------------------------------------------------

  useEffect(() => {
    if (!currentUser) return;

    const expensesRef = ref(
      database,
      `users/${currentUser.uid}/expenses`
    );

    const unsubscribe = onValue(
      expensesRef,
      (snapshot) => {
        const data = snapshot.val();

        if (data) {
          const expensesArray = Object.entries(data).map(
            ([id, expense]) => ({
              id,
              ...expense,
            })
          );

          // Newest expense first
          expensesArray.sort(
            (a, b) => b.createdAt - a.createdAt
          );

          setExpenses(expensesArray);
        } else {
          setExpenses([]);
        }
      },
      (error) => {
        console.error(
          "Error loading expenses:",
          error
        );
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // --------------------------------------------------
  // Add Expense
  // --------------------------------------------------

  const handleAddExpense = async (e) => {
    e.preventDefault();

    setExpenseError("");

    if (!amount || !description.trim() || !category) {
      setExpenseError(
        "Please fill in all expense fields."
      );
      return;
    }

    if (Number(amount) <= 0) {
      setExpenseError(
        "Amount must be greater than 0."
      );
      return;
    }

    try {
      setAddingExpense(true);

      const expensesRef = ref(
        database,
        `users/${currentUser.uid}/expenses`
      );

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
      console.error(
        "Error adding expense:",
        error
      );

      setExpenseError(
        "Unable to add expense. Please try again."
      );
    } finally {
      setAddingExpense(false);
    }
  };

  // --------------------------------------------------
  // Logout
  // --------------------------------------------------

  const handleLogout = async () => {
    try {
      await signOut(auth);

      localStorage.removeItem("idToken");

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Logout failed:",
        error
      );
    }
  };

  return (
    <div className="dashboard">

      {/* Header */}
      <header className="dashboard-header">

        <p>
          Welcome to Expense Tracker!!!
        </p>

        <div className="dashboard-actions">

          {!loadingProfile &&
            !profileComplete && (
              <div className="profile-warning">
                <span>
                  Your profile is incomplete.
                </span>

                <Link to="/profile">
                  Complete now
                </Link>
              </div>
            )}

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>
      </header>

      {/* Email Verification */}
      {!emailVerified && (
        <EmailVerification
          user={currentUser}
          onVerified={() =>
            setEmailVerified(true)
          }
        />
      )}

      {/* Main Content */}
      <main className="dashboard-content">

        <h2>Daily Expenses</h2>

        {/* Expense Form */}
        <form
          className="expense-form"
          onSubmit={handleAddExpense}
        >

          {/* Amount */}
          <div className="expense-field">

            <label>
              Amount
            </label>

            <input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) =>
                setAmount(e.target.value)
              }
              min="0"
              step="0.01"
            />

          </div>

          {/* Description */}
          <div className="expense-field">

            <label>
              Description
            </label>

            <input
              type="text"
              placeholder="Enter description"
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
            />

          </div>

          {/* Category */}
          <div className="expense-field">

            <label>
              Category
            </label>

            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
            >
              <option value="">
                Select category
              </option>

              <option value="Food">
                Food
              </option>

              <option value="Petrol">
                Petrol
              </option>

              <option value="Salary">
                Salary
              </option>

              <option value="Shopping">
                Shopping
              </option>

              <option value="Travel">
                Travel
              </option>

              <option value="Bills">
                Bills
              </option>

              <option value="Other">
                Other
              </option>
            </select>

          </div>

          <button
            type="submit"
            className="add-expense-button"
            disabled={addingExpense}
          >
            {addingExpense
              ? "Adding..."
              : "Add Expense"}
          </button>

        </form>

        {expenseError && (
          <p className="expense-error">
            {expenseError}
          </p>
        )}

        {/* Expense List */}
        <section className="expense-list">

          <h3>
            Your Expenses
          </h3>

          {expenses.length === 0 ? (
            <p className="no-expenses">
              No expenses added yet.
            </p>
          ) : (
            <div className="expenses-container">

              {expenses.map((expense) => (
                <div
                  className="expense-card"
                  key={expense.id}
                >

                  <div>
                    <h4>
                      ₹{expense.amount}
                    </h4>

                    <p>
                      {expense.description}
                    </p>
                  </div>

                  <div className="expense-right">

                    <span className="expense-category">
                      {expense.category}
                    </span>

                    <small>
                      {new Date(
                        expense.createdAt
                      ).toLocaleString()}
                    </small>

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