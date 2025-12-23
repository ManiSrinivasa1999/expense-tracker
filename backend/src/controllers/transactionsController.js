import sql from '../config/db.js';

const getTransactionsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const transactions = await sql`
      SELECT *
      FROM transactions
      WHERE user_id=${userId}
      ORDER BY created_at DESC
    `;
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const createTransaction = async (req, res) => {
  try {
    const { title, amount, category, user_id } = req.body;
    if (!title || amount === undefined || !category || !user_id) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    const result = await sql`
      INSERT INTO transactions (title, amount, category, user_id)
      VALUES (${title}, ${amount}, ${category}, ${user_id})
      RETURNING *
    `;
    res.status(201).json(result[0]);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    if (isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Invalid transaction ID.' });
    }
    const result = await sql`
      DELETE FROM transactions
      WHERE id=${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: 'Transaction not found.' });
    }
    res.status(200).json({ message: 'Transaction deleted successfully.' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error });
  }
};

const getSummary = async (req, res) => {
  try {
    const { userId } = req.params;
    const balanceResult = await sql`
      SELECT COALESCE(SUM(amount), 0) AS balance
      FROM transactions
      WHERE user_id=${userId}
    `;

    const incomeResult = await sql`
      SELECT COALESCE(SUM(amount), 0) AS income
      FROM transactions
      WHERE user_id=${userId} AND amount > 0
    `;

    const expensesResult = await sql`
      SELECT COALESCE(SUM(amount), 0) AS expenses
      FROM transactions
      WHERE user_id=${userId} AND amount < 0
    `;
    res.status(200).json({
      balance: balanceResult[0].balance,
      income: incomeResult[0].income,
      expenses: expensesResult[0].expenses,
    });
  } catch (error) {
    res.status(500).json({ error });
  }
};

export {
  getTransactionsByUserId,
  createTransaction,
  deleteTransaction,
  getSummary,
};
