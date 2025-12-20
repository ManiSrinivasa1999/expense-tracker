import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import sql from "./config/db.js";
import rateLimiter from "./middleware/rateLimiter.js";

const app = express();

app.use(rateLimiter);
app.use(express.json());

dotenv.config();

const PORT = process.env.PORT || 5001;

app.use(cors());

const initDB = async () => {
  try {
    await sql`CREATE TABLE IF NOT EXISTS transactions(
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      title VARCHAR(255) NOT NULL,
      amount DECIMAL(10, 2) NOT NULL,
      category VARCHAR(255) NOT NULL,
      created_at DATE NOT NULL DEFAULT CURRENT_DATE)`;
    console.log("Database connected and table ensured.");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1); // Exit the process with failure
  }
};

app.get("/", (req, res) => {
  res.send("Expense Tracker API is running");
});

app.get("/api/transactions/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const transactions =
      await sql`SELECT * FROM transactions WHERE user_id=${userId} ORDER BY created_at DESC`;
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
});

app.post("/api/transactions", async (req, res) => {
  try {
    const { title, amount, category, user_id } = req.body;
    if (!title || amount === undefined || !category || !user_id) {
      return res.status(400).json({ error: "All fields are required." });
    }
    const result =
      await sql`INSERT INTO transactions(title,amount,category,user_id) VALUES (${title},${amount},${category},${user_id}) RETURNING *`;
    res.status(201).json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
});

app.delete("/api/transactions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (isNaN(parseInt(id))) {
      return res.status(400).json({ error: "Invalid transaction ID." });
    }
    const result =
      await sql`DELETE FROM transactions WHERE id=${id} RETURNING *`;

    if (result.length === 0) {
      return res.status(404).json({ error: "Transaction not found." });
    }
    res.status(200).json({ message: "Transaction deleted successfully." });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    res.status(500).json({ error });
  }
});

app.get("/api/transactions/summary/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const balanceResult = sql`SELECT COALESCE(SUM(amount),0) as balance FROM transactions WHERE user_id=${userId}`;
    const incomeResult = sql`SELECT COALESCE(SUM(amount),0) as income FROM transactions WHERE user_id=${userId} AND amount > 0`;
    const expensesResult = sql`SELECT COALESCE(SUM(amount),0) as expenses FROM transactions WHERE user_id=${userId} AND amount < 0`;
    res.status(200).json({
      balance: balanceResult[0].balance,
      income: incomeResult[0].income,
      balance: expensesResult[0].expenses,
    });
  } catch (error) {
    res.status(500).json({ error });
  }
});

initDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server is running on port " + PORT);
  });
});
