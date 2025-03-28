const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const nodemailer = require('nodemailer');

dotenv.config();

const app = express();
app.use(bodyParser.json());


app.use(cors({
  origin: process.env.FRONTEND_URL,
}));
const port = process.env.PORT || 6600;

// Connect to MongoDB

const dbURI = process.env.MONGODB_URI;

mongoose.connect(dbURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((error) => console.error('MongoDB connection error:', error));
// Define Models (example)
// Define Models (example)
const Product = mongoose.model("Product", new mongoose.Schema({
  id: String,
  name: String,
  price: String,
  url: String,
  description: String,
  category: String
}));

const HealthcareTakerSchema = new mongoose.Schema({
  id: { type: String, required: true }, // Unique identifier for the healthcare taker
  name: { type: String, required: true }, // Name of the healthcare taker
  specialty: { type: String, required: true }, // Area of expertise or specialty
  phone: { type: String, required: true }, // Contact number
  email: { type: String, required: true }, // Email address
  location: { type: String, required: true }, // Address or location
  availability: { type: String, required: true }, // Availability details (e.g., "9 AM - 5 PM")
  image: { type: String, required: true }, // URL or path to the healthcare taker's image
  nearbyLocation: {
    type: {
      type: String, // GeoJSON type
      enum: ["Point"], // Must be 'Point'
      required: true,
    },
    coordinates: {
      type: [Number], // Array of numbers: [longitude, latitude]
      required: true,
    },
  },
});

HealthcareTakerSchema.index({ nearbyLocation: "2dsphere" }); // Create a geospatial index

const HealthcareTaker = mongoose.model("HealthcareTaker", HealthcareTakerSchema);


const PoliceInfo = mongoose.model("PoliceInfo", new mongoose.Schema({
  id: String, // Unique identifier for the police record
  officerName: String, // Name of the officer
  badgeNumber: String, // Badge number
  station: String, // Police station name
  location: String, // Location of the police station
  contact: String, // Contact number
  jurisdiction: String, // Jurisdiction or area of coverage
  email: String, // Email address
  image: String // URL or path to the officer's image
}));


const FireExtinguisher = mongoose.model("FireExtinguisher", new mongoose.Schema({
  id: String, // Unique identifier for the fire extinguisher
  type: String, // Type of extinguisher (e.g., "CO2", "Foam", "Water")
  location: String, // Location of the fire extinguisher
  maintenanceDate: Date, // Last maintenance date
  expiryDate: Date, // Expiry date for the fire extinguisher
  capacity: String, // Capacity of the extinguisher (e.g., "5kg")
  contact: String, // Emergency contact for maintenance or support
  image: String // URL or path to the fire extinguisher's image
}));



const ReminderSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Name of the reminder
  time: { type: String, required: true }, // Time for the reminder
  before: { type: Number, required: true }, // Time in minutes/hours before taking tablets
  after: { type: Number, required: true }, // Time in minutes/hours after taking tablets
  numberOfTablets: { type: Number, required: true }, // Number of tablets to be taken
  tabletList: { type: [String], required: true } // List of tablet names
});

const Reminder = mongoose.model("Reminder", ReminderSchema);

const Cart = mongoose.model("Cart", new mongoose.Schema({
  id: String,
  price: String,
  name: String,
  url: String,
  description: String,
  category: String
}));

const OrderSchema = new mongoose.Schema({
 
  products: [
    {
      id: { type: String},
      name: { type: String, required: true },
      price: { type: String, required: true },
      description: { type: String},
      url: { type: String, required: true },
      category: { type: String, required: true },
    },
  ],
  userDetails: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    pickupTime: { type: String, required: true },
    orderDay: { type: String, required: true },
    paymentMethod: { type: String, required: true },
  },
  billDetails: {
    totalCost: { type: Number, required: true },
    tax: { type: Number, required: true },
    discount: { type: Number, required: true },
    deliveryCharge: { type: Number, required: true },
    finalAmount: { type: Number, required: true },
  },
});

const Order = mongoose.model("Order", OrderSchema);

const PatientSchema = new mongoose.Schema({
  name: { type: String}, // Name of the patient
  disease: { type: String}, // Disease the patient is suffering from
  moneyRequired: { type: Number}, // Money required for treatment
  url: { type: String}, // URL of the patient's image
  deadline: { type: Date}, // Deadline for the treatment
  place: { type: String }, // Place of the patient
  hospitals: { type: [String] } // List of hospitals the patient is admitted in
});

const Patient = mongoose.model("Patient", PatientSchema);


const carouselSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: String, required: true },
  url: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
});

const Carousel = mongoose.model("Carousel", carouselSchema);

const Buy = mongoose.model("Buy", new mongoose.Schema({
  id: { type: String, required: true },
  price: { type: String, required: true },
  name: { type: String, required: true },
  url: { type: String, required: true },
  description: { type: String },
  category: { type: String, required: true },
}));

const User = mongoose.model("User", new mongoose.Schema({
  id: String,
  name: String,
  email: String,
  password: String,
}));

const Seller = mongoose.model("Seller", new mongoose.Schema({
  id: String,
  name: String,
  email: String,
  password: String,
}));

const AmbulanceSchema = new mongoose.Schema({
  vehicleNumber: { type: String }, // Unique number or identifier for the ambulance
  imageurl: { type: String},
  phoneNumber: { type: String}, // Contact number for the ambulance
  currentPlace: { type: String}, // Current location of the ambulance
  availability: { type: Boolean}, // Whether the ambulance is available or not
  nearbyLocation: {
    type: {
      type: String, // GeoJSON type
      enum: ["Point"], // Must be 'Point'
    
    },
    coordinates: {
      type: [Number], // Array of numbers: [longitude, latitude]
     
    },
  },
});

AmbulanceSchema.index({ nearbyLocation: "2dsphere" }); // Create a geospatial index

const Ambulance = mongoose.model("Ambulance", AmbulanceSchema);

const ImageSchema = new mongoose.Schema({
  image: {
    data: Buffer, // Binary data for the image
    contentType: String // MIME type (e.g., 'image/jpeg', 'image/png')
  },
  uploadedAt: { type: Date, default: Date.now } // Timestamp for when the image was uploaded
});

const Image = mongoose.model("Image", ImageSchema);

const MedicalShopSchema = new mongoose.Schema({
  shopName: { type: String }, // Name of the medical shop
  address: { type: String }, // Address of the shop
  phoneNumber: { type: String }, // Contact number of the shop
  availability: { type: Boolean}, // Whether the shop is currently open
  openingHours: { type: String}, // Opening hours (e.g., "8 AM - 10 PM")
  emergencyServices: { type: Boolean, default: false }, // Indicates if emergency services are available
  nearbyLocation: {
    type: {
      type: String, // GeoJSON type
      enum: ["Point"], // Must be 'Point'
      required: true,
    },
    coordinates: {
      type: [Number], // Array of numbers: [longitude, latitude]
      required: true,
    },
  },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }], // List of available products
});

MedicalShopSchema.index({ nearbyLocation: "2dsphere" }); // Create a geospatial index

const MedicalShop = mongoose.model("MedicalShop", MedicalShopSchema);


const DoctorSessionSchema = new mongoose.Schema({
  doctorName: { type: String }, // Name of the doctor
  email: { type: String}, // Email of the doctor
  imageurl: { type: String }, // Image of the doctor
  age: { type: Number, }, // Doctor's age
  fees: { type: Number,}, // Consultation fees
  category: { 
    type: String, 
    
    enum: ["Physical Treatment", "Mental Health", "Suggestions", "Precautions","Pregnency"] 
  }, // Category of the session
  availability: { type: Boolean, }, // Whether the doctor is available
  createdAt: { type: Date, default: Date.now } // Timestamp for session creation
});

const DoctorSession = mongoose.model("DoctorSession", DoctorSessionSchema);


const DoctorBookedSchema = new mongoose.Schema({
  doctor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'DoctorSession', 
    required: true 
  }, // Reference to the DoctorSession document
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }, // Reference to the User who booked the session
  timeSlot: { 
    type: Date, 
    required: true 
  }, // Date and time of the booked session
  status: {
    type: String,
    enum: ['Booked', 'Completed', 'Cancelled'],
    default: 'Booked' // Status of the booking
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }, // Timestamp for when the booking was created
  updatedAt: { 
    type: Date, 
    default: Date.now 
  } // Timestamp for when the booking was last updated
});

const DoctorBooked = mongoose.model("DoctorBooked", DoctorBookedSchema);





const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Email address
    pass: process.env.EMAIL_PASS, // App password
  },
});



app.post('/book', async (req, res) => {
  const { name, email, phone, specialty, location } = req.body;

  const mailOptions = {
    from: process.env.EMAIL_USER, // Your email
    to: email, // Doctor's email
    subject: `New Booking Request from ${name}`,
    text: `
      You have received a booking request.

      Details:
      - Name: ${name}
      - Specialty: ${specialty}
      - Phone: ${phone}
      - Location: ${location}
      
      Please confirm the booking with the patient.
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send({ message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send({ error: 'Error sending email' });
  }
});


const jwtkey = process.env.JWT_SECRET || "default-secret";

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>
  if (!token) {
    return res.status(403).json({ result: 'Token is required' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ result: 'Invalid token' });
  }
};

// POST: User Login
app.post("/user/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(404).send({ result: "Invalid email or password" });
    }

    // Generate JWT token
    jwt.sign({ user }, process.env.JWT_USER_SECRET, { expiresIn: process.env.JWT_EXPIRATION }, (err, token) => {
      if (err) {
        return res.status(500).send({ result: "Failed to generate token" });
      }
      res.status(200).send({ user, auth: token });
    });
  } catch (error) {
    console.error("Error logging in user", error);
    res.status(400).send({ result: "Error logging in user" });
  }
});

app.get('/medical-shops/nearby', async (req, res) => {
  const { longitude, latitude, maxDistance = 5000 } = req.query;

  if (!longitude || !latitude) {
    return res.status(400).json({ error: 'Longitude and latitude are required' });
  }

  try {
    const nearbyShops = await MedicalShop.find({
      nearbyLocation: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: parseInt(maxDistance, 10), // Max distance in meters
        },
      },
    });

    res.status(200).json(nearbyShops);
  } catch (err) {
    console.error('Error fetching nearby medical shops:', err);
    res.status(500).json({ error: 'Failed to fetch nearby medical shops', details: err.message });
  }
});


app.post("/healthcareTakers", async (req, res) => {
  try {
    const healthcareTaker = new HealthcareTaker(req.body);
    await healthcareTaker.save();
    res.status(201).send(healthcareTaker);
  } catch (error) {
    console.error("Error adding healthcare taker", error);
    res.status(400).send({ error: "Error adding healthcare taker" });
  }
});


app.get('/healthcare-takers/nearby', async (req, res) => {
  const { longitude, latitude, maxDistance = 5000 } = req.query;

  if (!longitude || !latitude) {
    return res.status(400).json({ error: 'Longitude and latitude are required' });
  }

  try {
    const nearbyTakers = await HealthcareTaker.find({
      nearbyLocation: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: parseInt(maxDistance, 10), // Max distance in meters
        },
      },
    });

    res.status(200).json(nearbyTakers);
  } catch (err) {
    console.error('Error fetching nearby healthcare takers:', err);
    res.status(500).json({ error: 'Failed to fetch nearby healthcare takers', details: err.message });
  }
});


app.get('/ambulances/nearby', async (req, res) => {
  const { longitude, latitude, maxDistance = 5000 } = req.query;

  if (!longitude || !latitude) {
    return res.status(400).json({ error: 'Longitude and latitude are required' });
  }

  try {
    const nearbyAmbulances = await Ambulance.find({
      nearbyLocation: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: parseInt(maxDistance, 10), // Max distance in meters
        },
      },
    });

    res.status(200).json(nearbyAmbulances);
  } catch (err) {
    console.error('Error fetching nearby ambulances:', err);
    res.status(500).json({ error: 'Failed to fetch nearby ambulances', details: err.message });
  }
});


app.post("/patients", async (req, res) => {
  try {
    const patient = new Patient(req.body);
    await patient.save();
    res.status(201).send(patient);
  } catch (error) {
    console.error("Error adding patient", error);
    res.status(400).send({ error: "Error adding patient" });
  }
});


// POST Route to Add Ambulance
app.post("/ambulances", async (req, res) => {
  try {
    const ambulanceData = req.body;
    // Create a new ambulance instance using the received data
    const ambulance = new Ambulance(ambulanceData);
    await ambulance.save();  // Save the ambulance to the database
    res.status(201).send(ambulance);  // Send the added ambulance as response
  } catch (error) {
    console.error("Error adding ambulance:", error);
    res.status(400).send({ error: "Error adding ambulance" });
  }
});

app.get('/reminders', async (req, res) => {
  try {
    const reminders = await Reminder.find();
    res.status(200).json(reminders);
  } catch (err) {
    console.error('Error fetching reminders:', err);
    res.status(500).json({ error: 'Failed to fetch reminders', details: err.message });
  }
});

app.get('/fire-extinguishers', async (req, res) => {
  try {
    const fireExtinguishers = await FireExtinguisher.find(); // Fetch all fire extinguisher records
    res.status(200).json(fireExtinguishers);
  } catch (err) {
    console.error('Error fetching fire extinguishers:', err);
    res.status(500).json({ 
      error: 'Failed to fetch fire extinguishers', 
      details: err.message 
    });
  }
});

app.post('/reminders', async (req, res) => {
  try {
    const reminder = new Reminder(req.body);
    const savedReminder = await reminder.save();
    res.status(201).json(savedReminder);
  } catch (err) {
    res.status(400).json({ error: 'Failed to add reminder', details: err.message });
  }
});

app.get('/police-services', async (req, res) => {
  try {
    const policeServices = await PoliceInfo.find();
    res.status(200).json(policeServices);
  } catch (err) {
    console.error('Error fetching police services:', err);
    res.status(500).json({ error: 'Failed to fetch police services', details: err.message });
  }
});

app.get('/healthcare-takers', async (req, res) => {
  try {
    const takers = await HealthcareTaker.find();
    res.status(200).json(takers);
  } catch (err) {
    console.error('Error fetching healthcare takers:', err);
    res.status(500).json({ error: 'Failed to fetch healthcare takers', details: err.message });
  }
});

app.get('/ambulances', async (req, res) => {
  try {
    const ambulances = await Ambulance.find();
    res.status(200).json(ambulances);
  } catch (err) {
    console.error('Error fetching ambulances:', err);
    res.status(500).json({ error: 'Failed to fetch ambulances', details: err.message });
  }
});

app.get('/donations', async (req, res) => {
  try {
    const donations = await Patient.find();
    res.status(200).json(donations);
  } catch (error) {
    console.error('Error fetching donations:', error);
    res.status(500).json({ message: 'Error fetching donations', error });
  }
});

app.delete('/reminders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Reminder.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).json({ error: 'Reminder not found' });
    }
    res.status(200).json({ message: 'Reminder deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete reminder', details: error.message });
  }
});



app.get("/carousel", async (req, res) => {
  try {
    const limit = req.query._limit ? parseInt(req.query._limit) : 0;
    const carousel = await Carousel.find().limit(limit);
    res.status(200).json(carousel);
  } catch (error) {
    res.status(500).send({ message: "Error fetching carousel data", error });
  }
});


// POST: Add Product (Protected Route)
app.post("/products", async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).send(product);
  } catch (error) {
    console.error("Error adding product", error);
    res.status(400).send({ error: "Error adding product" });
  }
});

// server.js (or wherever your routes are defined)
app.post("/doctors", async (req, res) => {
  try {
    const doctor = new DoctorSession(req.body);
    await doctor.save();
    res.status(201).send(doctor);
  } catch (error) {
    console.error("Error adding doctor", error);
    res.status(400).send({ error: "Error adding doctor" });
  }
});


app.post('/buy', async (req, res) => {
  try {
    const product = new Buy(req.body); // Create a new Buy object with the request body
    await product.save(); // Save the product to the database
    res.status(201).send(product); // Send a success response with the created product
  } catch (error) {
    console.error("Error adding product to Buy database", error);
    res.status(400).send({ error: "Error adding product" }); // Send an error response
  }
});


// Get all products from the "buy" collection
app.get('/buy', async (req, res) => {
  try {
    const products = await Buy.find();
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products', details: err.message });
  }
});

// Delete a product by ID
app.delete('/buy/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Buy.deleteOne({ id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product', details: err.message });
  }
});
// GET: Get Products (Protected Route)

app.get('/doctors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findOne({ id }); // Adjust based on your database structure
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    res.status(200).json(doctor);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch doctor data', details: err.message });
  }
});  


app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).send(products);
  } catch (error) {
    console.error("Error fetching products", error);
    res.status(400).send({ error: "Error fetching products" });
  }
});
app.get('/doctors', async (req, res) => {
  try {
    const doctorSessions = await DoctorSession.find(); // Fetch all sessions
    res.status(200).send(doctorSessions);
  } catch (error) {
    console.error('Error fetching doctor sessions:', error);
    res.status(400).send({ error: 'Error fetching doctor sessions' });
  }
});

// POST: User Signup (Optional)



// GET: Get Products


// GET: Get a specific Product
app.get("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).send({ error: "Product not found" });
    }
    res.status(200).send(product);
  } catch (error) {
    console.error("Error fetching product", error);
    res.status(400).send({ error: "Error fetching product" });
  }
});

// PUT: Update Product
app.put("/products/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) {
      return res.status(404).send({ error: "Product not found" });
    }
    res.status(200).send(product);
  } catch (error) {
    console.error("Error updating product", error);
    res.status(400).send({ error: "Error updating product" });
  }
});

// DELETE: Delete Product
app.delete("/products/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).send({ error: "Product not found" });
    }
    res.status(200).send({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product", error);
    res.status(400).send({ error: "Error deleting product" });
  }
});

// POST: Add to Cart
app.post("/cart", async (req, res) => {
  try {
    const cartItem = new Cart(req.body);
    await cartItem.save();
    res.status(201).send(cartItem);
  } catch (error) {
    console.error("Error adding to cart", error);
    res.status(400).send({ error: "Error adding to cart" });
  }
});

// GET: Get Cart Items
app.get("/cart", async (req, res) => {
  try {
    const cartItems = await Cart.find();
    res.status(200).send(cartItems);
  } catch (error) {
    console.error("Error fetching cart items", error);
    res.status(400).send({ error: "Error fetching cart items" });
  }
});

// DELETE: Remove Item from Cart
app.delete("/cart/:id", async (req, res) => {
  try {
    const cartItem = await Cart.findByIdAndDelete(req.params.id);
    if (!cartItem) {
      return res.status(404).send({ error: "Cart item not found" });
    }
    res.status(200).send({ message: "Cart item deleted successfully" });
  } catch (error) {
    console.error("Error deleting cart item", error);
    res.status(400).send({ error: "Error deleting cart item" });
  }
});

// POST: Create Order
app.post("/order", async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.status(201).send(order);
  } catch (error) {
    console.error("Error creating order", error);
    res.status(400).send({ error: "Error creating order" });
  }
});

// GET: Get Orders
app.get("/order", async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).send(orders);
  } catch (error) {
    console.error("Error fetching orders", error);
    res.status(400).send({ error: "Error fetching orders" });
  }
});

// DELETE: Delete Order
app.delete("/order/:id", async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).send({ error: "Order not found" });
    }
    res.status(200).send({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order", error);
    res.status(400).send({ error: "Error deleting order" });
  }
});

// POST: User Signup
app.post("/user", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).send(user);
  } catch (error) {
    console.error("Error signing up user", error);
    res.status(400).send({ error: "Error signing up user" });
  }
});

// POST: Seller Signup
app.post("/seller", async (req, res) => {
  try {
    const seller = new Seller(req.body);
    await seller.save();
    res.status(201).send(seller);
  } catch (error) {
    console.error("Error signing up seller", error);
    res.status(400).send({ error: "Error signing up seller" });
  }
});

// POST: User Login
app.get("/user", async (req, res) => {
  try {
    const { email, password } = req.query;
    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(404).send({ error: "Invalid email or password" });
    }
    res.status(200).send(user);
  } catch (error) {
    console.error("Error logging in user", error);
    res.status(400).send({ error: "Error logging in user" });
  }
});

// POST: Seller Login
app.get("/seller", async (req, res) => {
  try {
    const { email, password } = req.query;
    const seller = await Seller.findOne({ email, password });
    if (!seller) {
      return res.status(404).send({ error: "Invalid email or password" });
    }
    res.status(200).send(seller);
  } catch (error) {
    console.error("Error logging in seller", error);
    res.status(400).send({ error: "Error logging in seller" });
  }
});

// Start Server
app.listen(port, () => {
  console.log("Server is running on port 3000");
});
