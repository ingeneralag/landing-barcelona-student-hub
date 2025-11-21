import db from './db.js';
import bcrypt from 'bcrypt';

// Create rooms table
db.exec(`
  CREATE TABLE IF NOT EXISTS rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    city TEXT NOT NULL,
    price REAL NOT NULL,
    distance TEXT NOT NULL,
    image TEXT NOT NULL,
    features TEXT NOT NULL,
    available INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create bookings table
db.exec(`
  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id TEXT UNIQUE NOT NULL,
    room_id INTEGER NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    total_amount REAL NOT NULL,
    payment_date DATETIME NOT NULL,
    payment_intent_id TEXT,
    payment_status TEXT DEFAULT 'succeeded',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id)
  )
`);

// Add payment_status column if it doesn't exist (for existing databases)
try {
  db.exec(`ALTER TABLE bookings ADD COLUMN payment_status TEXT DEFAULT 'succeeded'`);
} catch (error) {
  // Column already exists, ignore error
}

// Add booking_code column if it doesn't exist (for existing databases)
try {
  db.exec(`ALTER TABLE bookings ADD COLUMN booking_code TEXT`);
} catch (error) {
  // Column already exists, ignore error
}

// Create index for booking_code for faster lookups
try {
  db.exec(`CREATE INDEX IF NOT EXISTS idx_bookings_booking_code ON bookings(booking_code)`);
} catch (error) {
  // Index already exists, ignore error
}

// Generate booking_code for old bookings that don't have one
try {
  const bookingsWithoutCode = db.prepare('SELECT id, booking_id FROM bookings WHERE booking_code IS NULL').all();
  if (bookingsWithoutCode.length > 0) {
    const updateStmt = db.prepare('UPDATE bookings SET booking_code = ? WHERE id = ?');
    const generateCode = () => {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let code = '';
      for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };
    
    for (const booking of bookingsWithoutCode) {
      let code = generateCode();
      let attempts = 0;
      // Ensure uniqueness
      while (attempts < 10) {
        const existing = db.prepare('SELECT id FROM bookings WHERE booking_code = ?').get(code);
        if (!existing) {
          break;
        }
        code = generateCode();
        attempts++;
      }
      updateStmt.run(code, booking.id);
    }
    console.log(`Generated booking_code for ${bookingsWithoutCode.length} old bookings`);
  }
} catch (error) {
  console.error('Error generating booking codes for old bookings:', error);
}

// Create users table for admin
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create index for faster queries
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_bookings_room_id ON bookings(room_id);
  CREATE INDEX IF NOT EXISTS idx_bookings_booking_id ON bookings(booking_id);
  CREATE INDEX IF NOT EXISTS idx_rooms_city ON rooms(city);
  CREATE INDEX IF NOT EXISTS idx_rooms_available ON rooms(available);
`);

// Insert default admin user if not exists
const adminExists = db.prepare('SELECT COUNT(*) as count FROM users WHERE username = ?').get('admin');
if (adminExists.count === 0) {
  const defaultPassword = 'admin123'; // Change this in production!
  const passwordHash = bcrypt.hashSync(defaultPassword, 10);
  db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run('admin', passwordHash);
  console.log('Default admin user created: username=admin, password=admin123');
}

// Insert default rooms from accommodations.ts if table is empty
const roomCount = db.prepare('SELECT COUNT(*) as count FROM rooms').get();
if (roomCount.count === 0) {
  const defaultRooms = [
    {
      title: 'Habitación Individual - Barcelona',
      type: 'Individual',
      city: 'Barcelona',
      price: 550,
      distance: '5 min de UB',
      image: '/src/assets/individual1.jpg',
      features: JSON.stringify(['Wi-Fi incluido', 'Limpieza semanal', 'Baño privado']),
      available: 1,
    },
    {
      title: 'Habitación Compartida - Barcelona',
      type: 'Compartida',
      city: 'Barcelona',
      price: 400,
      distance: '8 min de UPF',
      image: '/src/assets/shared1.jpg',
      features: JSON.stringify(['Wi-Fi incluido', '2 personas', 'Cocina equipada']),
      available: 0,
    },
    {
      title: 'Habitación Individual - Madrid',
      type: 'Individual',
      city: 'Madrid',
      price: 550,
      distance: '7 min de UCM',
      image: '/src/assets/individual2.jpg',
      features: JSON.stringify(['Wi-Fi incluido', 'Limpieza incluida', 'Zona de estudio']),
      available: 1,
    },
    {
      title: 'Habitación Compartida - Madrid',
      type: 'Compartida',
      city: 'Madrid',
      price: 400,
      distance: '12 min de UAM',
      image: '/src/assets/shared2.jpg',
      features: JSON.stringify(['Wi-Fi incluido', '2 personas', 'Cocina equipada']),
      available: 0,
    },
    {
      title: 'Habitación Individual - Valencia',
      type: 'Individual',
      city: 'Valencia',
      price: 480,
      distance: '6 min de UV',
      image: '/src/assets/individual3.jpg',
      features: JSON.stringify(['Wi-Fi incluido', 'Cerca de la playa']),
      available: 1,
    },
    {
      title: 'Habitación Compartida - Valencia',
      type: 'Compartida',
      city: 'Valencia',
      price: 300,
      distance: '10 min de UV',
      image: '/src/assets/shared3.jpg',
      features: JSON.stringify(['Wi-Fi incluido', '2 personas', 'Cocina equipada']),
      available: 0,
    },
  ];

  const insertRoom = db.prepare(`
    INSERT INTO rooms (title, type, city, price, distance, image, features, available)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((rooms) => {
    for (const room of rooms) {
      insertRoom.run(
        room.title,
        room.type,
        room.city,
        room.price,
        room.distance,
        room.image,
        room.features,
        room.available
      );
    }
  });

  insertMany(defaultRooms);
  console.log('Default rooms inserted');
}

console.log('Database initialized successfully');

