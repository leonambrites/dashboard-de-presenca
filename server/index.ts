import app from '../api/index.js';

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`🚀 Servidor local rodando na porta ${PORT} conectado ao Neon Postgres`);
  });
}

export default app;
