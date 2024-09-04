const express = require("express");
const app = express(); // Initialize the app object
const router = express.Router();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Define the schema and model
const dataSchema = new mongoose.Schema({
    
  Name: {
    type: String,
    required: true,
  },
  Availability: {
    type: Boolean,
    required: true,
  },
});

const Items = mongoose.model("Items", dataSchema);

// Routes
app.get("/data", (req, res) => res.send("Hello world"));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1); // Exit process if MongoDB connection fails
  });

// Create item endpoint
app.post("/createitems/single", async (req, res) => {
  const { Name, Availability } = req.body;

  try {
    if (!Name || typeof Availability !== 'boolean') {
      return res.status(400).json({ status: "Bad request" });
    }

    const createitem = await Items.create({
      Name,
      Availability,
    });
    console.log(createitem);
    res.json({ status: "Success" });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      Message: "Something went wrong",
    });
  }
});


app.post("/createitems/bulk", async (req, res) => {
  const items = req.body; // Expecting an array of items in the request body

  try {
    // Check if items is an array and not empty
    console.log(items);
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ status: "Bad request", message: "Items must be a non-empty array" });
    }

    // Validate each item in the array
    for (const item of items) {
      const { Name, Availability } = item;
      if (!Name || typeof Availability !== "boolean") {
        return res.status(400).json({ status: "Bad request", message: "Each item must have a valid Name and Availability" });
      }
    }

    // Create items in bulk
    const createdItems = await Items.insertMany(items);
    console.log(createdItems);

    res.json({ status: "Success", data: createdItems });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      Message: "Something went wrong",
    });
  }
});

app.get('/getallitems', async(req, res) => {
    try{
        const allitems = await Items.find({});
        res.status(200).send(allitems);
    }
    catch(error){
       console.log(error);
       res.status(500).json({
          errorMessage: "Something went wrong"
       });
    }
});

app.get('/getitemsbyavailability', async (req, res) => {
  try {
   
    const { Availability } = req.query;
    
    // Check if the query parameter is provided
    if (Availability === undefined) {
      return res.status(400).json({ error: 'Availability query parameter is required' });
    }
    
    const isAvailable = Availability.toLowerCase() === 'true';

    const items = await Items.find({ Availability: isAvailable });

    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

app.put('/updateAvailability', async (req, res) => {
  try {
    const { id, Availability } = req.body;

    if (!id || typeof Availability !== 'boolean') {
      return res.status(400).json({ error: 'Invalid request data' });
    }

    const updatedData = await Items.findByIdAndUpdate(
      id,
      { Availability: Availability },
      { new: true } // Return the updated document
    );
 console.log(updatedData);
    if (!updatedData) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.status(200).json(updatedData);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update item' });
  }
});

