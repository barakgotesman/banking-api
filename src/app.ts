import 'dotenv/config';
import express from 'express';
import accountRoutes from './routes/accounts';

const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Banking API is running' });
});

app.use('/accounts', accountRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
