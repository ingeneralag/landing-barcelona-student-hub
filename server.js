import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import db from './database/db.js';
import bcrypt from 'bcrypt';
import './database/migrations.js'; // Initialize database

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4242;

// Initialize Stripe with secret key
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  console.error('ERROR: STRIPE_SECRET_KEY environment variable is not set!');
  process.exit(1);
}
const stripe = new Stripe(stripeSecretKey);

// Configure CORS with explicit options for Safari compatibility
app.use(cors({
  origin: true, // Allow all origins (or specify your domain)
  credentials: true, // Allow credentials
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // 24 hours
}));

// Increase body size limit for file uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Handle preflight requests explicitly for Safari
app.options(/.*/, (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.sendStatus(200);
});

app.use(express.json());

// Serve static files from public directory
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Serve static files from dist directory (Vite build output)
// Serve static files with cache control
app.use(express.static(path.join(__dirname, 'dist'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    } else if (path.match(/\.(js|css)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
}));

// Handle SPA routing - serve index.html for all non-API routes
// Must be after all API routes
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'public', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'room-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit (increased from 5MB)
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Simple session storage (in production, use proper session management)
const sessions = new Map();

// Create Payment Intent endpoint
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency, roomId, customerInfo, bookingDates } = req.body;

    if (!amount || !currency) {
      return res.status(400).json({ error: 'Amount and currency are required' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Amount in cents
      currency: currency || 'eur',
      metadata: {
        roomId: roomId?.toString() || '',
        customerName: customerInfo?.name || '',
        customerEmail: customerInfo?.email || '',
        checkIn: bookingDates?.checkIn || '',
        checkOut: bookingDates?.checkOut || '',
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: error.message });
  }
});

// Authentication middleware
const requireAuth = (req, res, next) => {
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  if (!sessionId || !sessions.has(sessionId)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.user = sessions.get(sessionId);
  next();
};

// Auth Routes
app.post('/api/auth/login', (req, res) => {
  try {
    // Set headers for Safari compatibility
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    const { username, password } = req.body;
    
    console.log('Login attempt:', { username, hasPassword: !!password });
    
    if (!username || !password) {
      console.log('Missing credentials');
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    
    if (!user) {
      console.log('User not found:', username);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const passwordMatch = bcrypt.compareSync(password, user.password_hash);
    if (!passwordMatch) {
      console.log('Password mismatch for user:', username);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create session
    const sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    sessions.set(sessionId, { id: user.id, username: user.username });
    
    console.log('Login successful for user:', username, 'sessionId:', sessionId);
    
    res.json({ sessionId, username: user.username });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/auth/check', requireAuth, (req, res) => {
  res.json({ authenticated: true, user: req.user });
});

app.post('/api/auth/logout', (req, res) => {
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  if (sessionId) {
    sessions.delete(sessionId);
  }
  res.json({ success: true });
});

// Upload image endpoint
app.post('/api/upload', requireAuth, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ imageUrl });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: error.message });
  }
});

// Error handling for multer
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB' });
    }
    return res.status(400).json({ error: error.message });
  }
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  next();
});

// Rooms Routes
app.get('/api/rooms', (req, res) => {
  try {
    // Set cache control headers to prevent caching
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('ETag', `"${Date.now()}"`); // Add ETag for cache busting
    
    const rooms = db.prepare('SELECT * FROM rooms ORDER BY city, id').all();
    const formattedRooms = rooms.map(room => ({
      ...room,
      features: JSON.parse(room.features),
      available: Boolean(room.available),
    }));
    res.json(formattedRooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/rooms/:id', (req, res) => {
  try {
    // Set cache control headers to prevent caching
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('ETag', `"${Date.now()}"`); // Add ETag for cache busting
    
    const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(req.params.id);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.json({
      ...room,
      features: JSON.parse(room.features),
      available: Boolean(room.available),
    });
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/rooms', requireAuth, (req, res) => {
  try {
    const { title, type, city, price, distance, image, features, available } = req.body;
    
    if (!title || !type || !city || !price || !distance || !image) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = db.prepare(`
      INSERT INTO rooms (title, type, city, price, distance, image, features, available, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(
      title,
      type,
      city,
      price,
      distance,
      image,
      JSON.stringify(features || []),
      available ? 1 : 0
    );

    const newRoom = db.prepare('SELECT * FROM rooms WHERE id = ?').get(result.lastInsertRowid);
    res.json({
      ...newRoom,
      features: JSON.parse(newRoom.features),
      available: Boolean(newRoom.available),
    });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/rooms/:id', requireAuth, (req, res) => {
  try {
    const { title, type, city, price, distance, image, features, available } = req.body;
    
    const existingRoom = db.prepare('SELECT * FROM rooms WHERE id = ?').get(req.params.id);
    if (!existingRoom) {
      return res.status(404).json({ error: 'Room not found' });
    }

    db.prepare(`
      UPDATE rooms 
      SET title = ?, type = ?, city = ?, price = ?, distance = ?, image = ?, features = ?, available = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      title || existingRoom.title,
      type || existingRoom.type,
      city || existingRoom.city,
      price !== undefined ? price : existingRoom.price,
      distance || existingRoom.distance,
      image || existingRoom.image,
      features ? JSON.stringify(features) : existingRoom.features,
      available !== undefined ? (available ? 1 : 0) : existingRoom.available,
      req.params.id
    );

    const updatedRoom = db.prepare('SELECT * FROM rooms WHERE id = ?').get(req.params.id);
    res.json({
      ...updatedRoom,
      features: JSON.parse(updatedRoom.features),
      available: Boolean(updatedRoom.available),
    });
  } catch (error) {
    console.error('Error updating room:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/rooms/:id', requireAuth, (req, res) => {
  try {
    const roomId = parseInt(req.params.id);
    const deleteBookings = req.query.deleteBookings === 'true'; // Check if we should delete bookings too
    
    if (isNaN(roomId)) {
      return res.status(400).json({ error: 'Invalid room ID' });
    }

    // Check if room exists
    const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(roomId);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Check if there are any bookings for this room
    const bookingsResult = db.prepare('SELECT COUNT(*) as count FROM bookings WHERE room_id = ?').get(roomId);
    const bookingCount = bookingsResult ? bookingsResult.count : 0;
    
    if (bookingCount > 0 && !deleteBookings) {
      // Get booking details for better error message
      const bookings = db.prepare('SELECT id, booking_id, customer_name FROM bookings WHERE room_id = ? LIMIT 5').all(roomId);
      return res.status(400).json({ 
        error: `Cannot delete room with existing bookings (${bookingCount} booking${bookingCount > 1 ? 's' : ''} found). Please delete the bookings first.`,
        hasBookings: true,
        bookingCount: bookingCount
      });
    }

    // If deleteBookings is true, delete all bookings for this room first
    if (deleteBookings && bookingCount > 0) {
      const deleteBookingsResult = db.prepare('DELETE FROM bookings WHERE room_id = ?').run(roomId);
      console.log(`Deleted ${deleteBookingsResult.changes} booking(s) for room ${roomId}`);
    }

    // Delete the room
    try {
      const result = db.prepare('DELETE FROM rooms WHERE id = ?').run(roomId);
      
      if (result.changes === 0) {
        return res.status(404).json({ error: 'Room not found' });
      }

      res.json({ 
        success: true, 
        message: deleteBookings && bookingCount > 0 
          ? `Room and ${bookingCount} associated booking(s) deleted successfully`
          : 'Room deleted successfully'
      });
    } catch (deleteError) {
      // If foreign key constraint still fails, it means there are bookings we didn't catch
      if (deleteError.message && deleteError.message.includes('FOREIGN KEY')) {
        const bookingsResult = db.prepare('SELECT COUNT(*) as count FROM bookings WHERE room_id = ?').get(roomId);
        const bookingCount = bookingsResult ? bookingsResult.count : 0;
        return res.status(400).json({ 
          error: `Cannot delete room. There are ${bookingCount} booking${bookingCount > 1 ? 's' : ''} associated with this room. Please delete the bookings first.`,
          hasBookings: true,
          bookingCount: bookingCount
        });
      }
      throw deleteError;
    }
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({ error: error.message || 'Failed to delete room' });
  }
});

// Bookings Routes
app.get('/api/bookings', requireAuth, (req, res) => {
  try {
    const bookings = db.prepare(`
      SELECT b.*, r.title as room_title, r.city as room_city, r.image as room_image, 
             r.type as room_type, r.features as room_features
      FROM bookings b
      LEFT JOIN rooms r ON b.room_id = r.id
      ORDER BY b.created_at DESC
    `).all();
    
    // Parse room_features JSON for each booking
    const bookingsWithParsedFeatures = bookings.map(booking => {
      if (booking.room_features) {
        try {
          booking.room_features = JSON.parse(booking.room_features);
        } catch (e) {
          booking.room_features = [];
        }
      }
      return booking;
    });
    
    res.json(bookingsWithParsedFeatures);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/bookings/:id', requireAuth, (req, res) => {
  try {
    const bookingId = parseInt(req.params.id);
    
    if (isNaN(bookingId)) {
      return res.status(400).json({ error: 'Invalid booking ID' });
    }

    // Check if booking exists
    const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Delete the booking
    const result = db.prepare('DELETE FROM bookings WHERE id = ?').run(bookingId);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({ success: true, message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ error: error.message || 'Failed to delete booking' });
  }
});

// Function to generate a unique booking code
function generateBookingCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing characters (0, O, I, 1)
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Function to ensure unique booking code
function getUniqueBookingCode() {
  let code = generateBookingCode();
  let attempts = 0;
  while (attempts < 10) {
    const existing = db.prepare('SELECT id FROM bookings WHERE booking_code = ?').get(code);
    if (!existing) {
      return code;
    }
    code = generateBookingCode();
    attempts++;
  }
  // Fallback: use timestamp-based code if random generation fails
  return 'BK' + Date.now().toString(36).toUpperCase().slice(-6);
}

// Verify booking by code (public endpoint)
// Supports both booking_code and booking_id for backward compatibility
app.get('/api/bookings/verify/:code', (req, res) => {
  try {
    const code = req.params.code.toUpperCase().trim();
    
    if (!code || code.length < 3) {
      return res.status(400).json({ error: 'Invalid booking code' });
    }

    console.log(`Verifying booking with code: ${code}`);

    // Try to find by booking_code first, then by booking_id (for backward compatibility)
    let booking = db.prepare(`
      SELECT b.*, r.title as room_title, r.city as room_city, r.image as room_image, 
             r.type as room_type, r.distance as room_distance, r.features as room_features
      FROM bookings b
      LEFT JOIN rooms r ON b.room_id = r.id
      WHERE b.booking_code = ? OR b.booking_id = ?
    `).get(code, code);

    // If not found, try partial match on booking_id (for cases like BK-0VQU7 matching BK-0VQU7BX6)
    if (!booking && code.includes('-')) {
      const partialCode = code.replace('BK-', '');
      booking = db.prepare(`
        SELECT b.*, r.title as room_title, r.city as room_city, r.image as room_image, 
               r.type as room_type, r.distance as room_distance, r.features as room_features
        FROM bookings b
        LEFT JOIN rooms r ON b.room_id = r.id
        WHERE b.booking_id LIKE ? OR b.booking_code LIKE ?
      `).get(`%${partialCode}%`, `%${partialCode}%`);
    }

    // If not found, try to find by booking_id only (for old bookings without booking_code)
    if (!booking) {
      booking = db.prepare(`
        SELECT b.*, r.title as room_title, r.city as room_city, r.image as room_image, 
               r.type as room_type, r.distance as room_distance, r.features as room_features
        FROM bookings b
        LEFT JOIN rooms r ON b.room_id = r.id
        WHERE b.booking_id = ?
      `).get(code);
      
      // If found but doesn't have booking_code, generate one
      if (booking && !booking.booking_code) {
        const newBookingCode = getUniqueBookingCode();
        db.prepare('UPDATE bookings SET booking_code = ? WHERE id = ?').run(newBookingCode, booking.id);
        booking.booking_code = newBookingCode;
        console.log(`Generated booking_code ${newBookingCode} for booking ${booking.booking_id}`);
      }
    }

    if (!booking) {
      console.log(`No booking found for code: ${code}`);
      return res.status(404).json({ error: 'No booking found with this code' });
    }

    console.log(`Booking found: ${booking.booking_id} (code: ${booking.booking_code})`);

    // Parse features if they exist
    if (booking.room_features) {
      try {
        booking.room_features = JSON.parse(booking.room_features);
      } catch (e) {
        booking.room_features = [];
      }
    }

    res.json(booking);
  } catch (error) {
    console.error('Error verifying booking:', error);
    res.status(500).json({ error: error.message || 'Failed to verify booking' });
  }
});

// Manual booking endpoint (requires auth)
app.post('/api/bookings/manual', requireAuth, (req, res) => {
  try {
    const {
      bookingId,
      roomId,
      customerName,
      customerEmail,
      customerPhone,
      checkIn,
      checkOut,
      totalAmount,
      paymentStatus = 'pending',
    } = req.body;

    if (!bookingId || !roomId || !customerName || !customerEmail || !checkIn || !checkOut || !totalAmount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate unique booking code
    const bookingCode = getUniqueBookingCode();

    console.log('Creating manual booking with data:', {
      bookingId,
      bookingCode,
      roomId,
      customerName,
      customerEmail,
      checkIn,
      checkOut,
      totalAmount,
      paymentStatus,
    });

    const result = db.prepare(`
      INSERT INTO bookings (
        booking_id, booking_code, room_id, customer_name, customer_email, customer_phone,
        check_in, check_out, total_amount, payment_date, payment_intent_id, payment_status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, NULL, ?)
    `).run(
      bookingId,
      bookingCode,
      roomId,
      customerName,
      customerEmail,
      customerPhone || '',
      checkIn,
      checkOut,
      totalAmount,
      paymentStatus
    );

    const newBooking = db.prepare(`
      SELECT b.*, r.title as room_title, r.city as room_city, r.image as room_image, r.type as room_type, r.distance as room_distance, r.features as room_features
      FROM bookings b
      LEFT JOIN rooms r ON b.room_id = r.id
      WHERE b.id = ?
    `).get(result.lastInsertRowid);

    console.log('Manual booking created successfully:', newBooking);
    res.json(newBooking);
  } catch (error) {
    console.error('Error creating manual booking:', error);
    res.status(500).json({ error: error.message || 'Failed to create booking' });
  }
});

// Regular booking endpoint (no auth required - used by checkout)
app.post('/api/bookings', (req, res) => {
  try {
    const {
      bookingId,
      roomId,
      customerName,
      customerEmail,
      customerPhone,
      checkIn,
      checkOut,
      totalAmount,
      paymentIntentId,
      paymentStatus = 'succeeded',
    } = req.body;

    if (!bookingId || !roomId || !customerName || !customerEmail || !checkIn || !checkOut || !totalAmount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate unique booking code
    const bookingCode = getUniqueBookingCode();

    console.log('Creating booking with data:', {
      bookingId,
      bookingCode,
      roomId,
      customerName,
      customerEmail,
      checkIn,
      checkOut,
      totalAmount,
      paymentStatus,
    });

    const result = db.prepare(`
      INSERT INTO bookings (
        booking_id, booking_code, room_id, customer_name, customer_email, customer_phone,
        check_in, check_out, total_amount, payment_date, payment_intent_id, payment_status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?)
    `).run(
      bookingId,
      bookingCode,
      roomId,
      customerName,
      customerEmail,
      customerPhone || '',
      checkIn,
      checkOut,
      totalAmount,
      paymentIntentId || null,
      paymentStatus
    );

    const newBooking = db.prepare(`
      SELECT b.*, r.title as room_title, r.city as room_city, r.image as room_image, r.type as room_type
      FROM bookings b
      LEFT JOIN rooms r ON b.room_id = r.id
      WHERE b.id = ?
    `).get(result.lastInsertRowid);

    console.log('Booking created successfully:', newBooking);
    res.json(newBooking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: error.message || 'Failed to create booking' });
  }
});

// Create Payment Intent endpoint
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency, roomId, customerInfo, bookingDates } = req.body;

    if (!amount || !currency) {
      return res.status(400).json({ error: 'Amount and currency are required' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Amount in cents
      currency: currency || 'eur',
      metadata: {
        roomId: roomId?.toString() || '',
        customerName: customerInfo?.name || '',
        customerEmail: customerInfo?.email || '',
        checkIn: bookingDates?.checkIn || '',
        checkOut: bookingDates?.checkOut || '',
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Database initialized`);
  
  // Verify admin user exists
  try {
    const adminUser = db.prepare('SELECT * FROM users WHERE username = ?').get('admin');
    if (adminUser) {
      console.log('✓ Admin user verified: username=admin');
    } else {
      console.log('⚠ WARNING: Admin user not found! Run migrations manually.');
    }
  } catch (error) {
    console.error('Error checking admin user:', error);
  }
});

