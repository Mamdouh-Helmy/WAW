import './config/env.js';
import express    from 'express';
import cors       from 'cors';
import helmet     from 'helmet';
import connectDB  from './config/db.js';
import authRoutes     from './routes/auth.js';
import articleRoutes  from './routes/articles.js';
import podcastRoutes  from './routes/podcasts.js';
import userRoutes     from './routes/users.js';
import footerRoutes from './routes/footer.js';
import reelRoutes from './routes/reels.js';

connectDB();

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth',     authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/podcasts', podcastRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/footer', footerRoutes);
app.use('/api/reels', reelRoutes);

app.get('/api/health', (_, res) => res.json({ status: 'ok', time: new Date() }));

app.use((err, req, res) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server Error', error: err.message });
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));