import express from 'express';
import path from 'path';
import { apiMiddleware } from './api-backend.js';

const app = express();

// 1. መጀመሪያ የ API ማገናኛዎችን (Middleware) መጫን
app.use(apiMiddleware);

// 2. Vite build ሲያደርግ የሚሰጠውን 'dist' የተባለ static ማህደር ማጋራት
// ማሳሰቢያ፦ በ .cjs ውስጥ __dirname በቀጥታ ይሠራል፣ ስለዚህ ያለምንም እንክብካቤ መጠቀም ይቻላል።
app.use(express.static(path.join(__dirname, 'dist')));

// 3. ማንኛውም ሌላ ጥያቄ ሲመጣ የ React ን index.html እንዲያይ ማድረግ
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// 4. ሰርቨሩን ለማስነሳት መዘጋጀት (የፖርት ቁጥር)
const PORT = process.env.PORT || 10000;

// 5. ሰርቨሩን በ listen ማነሳሳት
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
