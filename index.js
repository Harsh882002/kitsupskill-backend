import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import cors from 'cors';

dotenv.config(); // Load environment variables

const app = express();

// Middleware setup
app.use(express.json()); // For parsing JSON bodies
app.use(cors()); // Enable cross-origin resource sharing

// API Routes
app.use('/api/auth', authRoutes); 

 
// Start server on specified port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
