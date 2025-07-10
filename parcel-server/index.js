const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const admin = require("firebase-admin");

dotenv.config();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: ["http://localhost:5173", "https://zap-shift-da723.web.app"],
    credentials: true,
  })
);
app.use(express.json());
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const decodeKey = Buffer.from(process.env.FB_SERVICE_KEY, 'base64').toString('utf8');
const serviceAccount = JSON.parse(decodeKey);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2i7tcvj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();
    console.log("✅ Connected to MongoDB successfully!");

    const db = client.db("zap_shift_user"); // 🎯 Your target database
    const parcelCollection = db.collection("parcel"); // 🎯 Your collection
    const paymentsCollection = db.collection("payments"); // 🎯 Your collection
    const userCollection = db.collection("users"); // 🎯 Your collection
    const ridersCollection = db.collection("riders"); // 🎯 Your collection
    const trackingCollection = db.collection("tracking"); // 🎯 Your collection

    const verifyFBToken = async (req, res, next) => {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).send({ error: "Unauthorized" });
      }

      const token = authHeader.split(" ")[1];
      console.log(token);

      try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        console.log(decodedToken);
        req.user = decodedToken; // user info available
        next();
      } catch (error) {
        return res.status(403).send({ error: "Forbidden" });
      }
    };

    const verifyAdmin = async (req, res, next) => {
      console.log("admin trig");
      const email = req.user.email;
      console.log(email);
      const query = { email };
      const user = await userCollection.findOne(query);
      console.log(user);
      if (!user || user.role !== "admin") {
        return res.status(403).send({ message: "forbidden access" });
      }
      next();
    };

    // Example route: get all parcels
    app.get("/parcels", async (req, res) => {
      try {
        const { email, payment_status, delivery_status } = req.query;

        const query = {};
        if (email) query.created_by = email;
        if (payment_status) query.payment_status = payment_status;
        if (delivery_status) query.delivery_status = delivery_status;

        const parcels = await parcelCollection.find(query).toArray();
        console.log(parcels);
        res.send(parcels);
      } catch (error) {
        console.error("❌ Error fetching parcels:", error);
        res.status(500).send({ error: "Failed to fetch parcels" });
      }
    });

    // PATCH /parcels/assign/:id
    app.patch("/parcels/assign/:id", async (req, res) => {
      const { id } = req.params;
      const { riderId, riderName, riderEmail } = req.body;

      if (!riderId || !riderName) {
        return res.status(400).send({ message: "Rider info is required" });
      }

      try {
        const result = await parcelCollection.updateOne(
          { _id: new ObjectId(id) },
          {
            $set: {
              delivery_status: "rider_assigned",
              assigned_rider_id: riderId,
              assigned_rider_Email: riderEmail,
              assigned_rider_name: riderName,
            },
          }
        );

        if (result.modifiedCount === 0) {
          return res.status(404).send({ message: "Parcel not found" });
        }

        res.send({ success: true, message: "Rider assigned successfully" });
      } catch (error) {
        console.error("Error assigning rider:", error);
        res.status(500).send({ message: "Internal Server Error" });
      }
    });

    // Express route (Node.js backend)
    app.get("/rider/parcels", async (req, res) => {
      const email = req.query.email;

      if (!email) {
        return res.status(400).json({ message: "Rider email is required" });
      }

      try {
        const parcels = await parcelCollection
          .find({
            assigned_rider_Email: email,
            delivery_status: { $in: ["rider_assigned", "in_transit"] },
          })
          .toArray();

        res.status(200).json(parcels);
      } catch (error) {
        console.error("Error fetching parcels:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    app.get("/rider/parcels/delivered", async (req, res) => {
      const email = req.query.email;

      if (!email) {
        return res.status(400).json({ message: "Rider email is required" });
      }

      try {
        const parcels = await parcelCollection
          .find({
            assigned_rider_Email: email,
            delivery_status: "delivered",
          })
          .toArray();

        res.status(200).json(parcels);
      } catch (error) {
        console.error("Error fetching parcels:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    app.patch("/parcels/cash-out/:id", async (req, res) => {
      const { id } = req.params;

      try {
        const updateFields = {
          cashed_out: true,
          cashOut_time: new Date(), // Save current date/time here
        };

        const result = await parcelCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateFields }
        );

        if (result.modifiedCount === 0) {
          return res
            .status(404)
            .send({ message: "Parcel not found or already cashed out" });
        }

        res.send({
          success: true,
          message: "Cash out time recorded successfully",
        });
      } catch (error) {
        console.error("Error updating cash out:", error);
        res.status(500).send({ message: "Internal Server Error" });
      }
    });

    // POST /api/tracking
    app.post("/tracking", async (req, res) => {
      const { tracking_id, status, note, actor } = req.body;

      try {
        const result = await trackingCollection.insertOne({
          tracking_id, // ✅ Use as string
          status,
          timestamp: new Date(),
          note: note || "",
          actor: actor || "system",
        });

        // ✅ Optionally update parcel by tracking_id
        await parcelCollection.updateOne(
          { tracking_id }, // match the string tracking_id
          { $set: { delivery_status: status } }
        );

        res.send({ success: true, insertedId: result.insertedId });
      } catch (error) {
        console.error("Error inserting tracking log:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    // GET /api/tracking/:parcelId
    app.get("/tracking/:trackingId", async (req, res) => {
      const { trackingId } = req.params;
      const userEmail = req.query.email; // logged-in user's email from frontend

      try {
        // ✅ Match by 'created_by' not 'senderEmail'
        const parcel = await parcelCollection.findOne({
          tracking_id: trackingId,
          created_by: userEmail,
        });
        console.log(parcel);

        if (!parcel) {
          return res.status(403).json({
            message: "Unauthorized access to this parcel or parcel not found",
          });
        }

        const logs = await trackingCollection
          .find({ tracking_id: trackingId })
          .sort({ timestamp: 1 })
          .toArray();

        res.send(logs);
      } catch (error) {
        console.error("Error fetching tracking logs:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    // pending data get
    app.get("/riders/pending", verifyFBToken, verifyAdmin, async (req, res) => {
      try {
        const pendingRiders = await ridersCollection
          .find({ status: "pending" })
          .toArray();
        res.status(200).send(pendingRiders);
      } catch (error) {
        console.error("Error fetching pending riders:", error);
        res.status(500).send({ error: "Failed to get pending riders" });
      }
    });

    // active riders approve
    app.get("/riders/active", verifyFBToken, verifyAdmin, async (req, res) => {
      try {
        const activeRiders = await ridersCollection
          .find({ status: "approved" })
          .toArray();
        res.send(activeRiders);
      } catch (error) {
        console.error("Error fetching active riders:", error);
        res.status(500).send({ error: "Failed to fetch active riders" });
      }
    });

    // GET /riders/by-district?district=Dhaka
    // GET /riders/by-district?district=DistrictName
    app.get(
      "/riders/by-district",
      verifyFBToken,
      verifyAdmin,
      async (req, res) => {
        const { district } = req.query;

        if (!district) {
          return res.status(400).send({ error: "District is required" });
        }

        try {
          const riders = await ridersCollection
            .find({ district, status: "approved" }) // only approved riders
            .project({ name: 1, email: 1, _id: 1 }) // return only necessary fields
            .toArray();

          res.send(riders);
        } catch (err) {
          console.error("Failed to fetch riders by district", err);
          res.status(500).send({ error: "Internal Server Error" });
        }
      }
    );

    // pending riders approve
    // PATCH /riders/status/:id
    app.patch(
      "/riders/status/:id",
      verifyFBToken,
      verifyAdmin,
      async (req, res) => {
        const { id } = req.params;
        const { status } = req.body;

        try {
          const riderFilter = { _id: new ObjectId(id) };

          // 1️⃣ Update only the rider's status (NOT role)
          const updateRiderDoc = {
            $set: { status },
          };

          const riderResult = await ridersCollection.updateOne(
            riderFilter,
            updateRiderDoc
          );

          // 2️⃣ If approved, get email and update role in users collection
          if (status === "approved") {
            const rider = await ridersCollection.findOne(riderFilter);
            if (rider?.email) {
              await userCollection.updateOne(
                { email: rider.email },
                { $set: { role: "rider" } }
              );
            }
          }

          res.send(riderResult);
        } catch (error) {
          console.error("Status update failed:", error);
          res.status(500).send({ error: "Internal server error" });
        }
      }
    );

    app.get("/parcels/delivery-status-count", async (req, res) => {
      try {
        const pipeline = [
          {
            $group: {
              _id: "$delivery_status",
              count: { $sum: 1 },
            },
          },
          {
            $project: {
              delivery_status: "$_id",
              count: 1,
              _id: 0,
            },
          },
        ];

        const result = await parcelCollection.aggregate(pipeline).toArray();
        res.send(result);
      } catch (err) {
        res.status(500).send({ error: "Failed to get delivery status counts" });
      }
    });

    // GET /parcels/user/:email
    app.get("/parcels/user/:email", async (req, res) => {
      try {
        const email = req.params.email;
        const query = { created_by: email };
        const userParcels = await parcelCollection.find(query).toArray();
        res.send(userParcels);
      } catch (error) {
        console.error("❌ Error fetching user parcels:", error);
        res.status(500).send({ error: "Failed to fetch user parcels" });
      }
    });

    // GET /users/role?email=user@example.com
    app.get("/users/role", verifyFBToken, async (req, res) => {
      const { email } = req.query;
      console.log("email", email);
      if (!email) return res.status(400).send({ message: "Email is required" });

      try {
        const user = await userCollection.findOne(
          { email },
          { projection: { role: 1, _id: 0 } }
        );

        if (!user) {
          return res.status(404).send({ message: "User not found" });
        }

        res.send({ role: user.role });
      } catch (err) {
        res.status(500).send({ message: "Server error" });
        console.log(err);
      }
    });

    app.get("/users/search", async (req, res) => {
      const { email } = req.query;
      if (!email) return res.status(400).send({ message: "Email is required" });

      const regex = new RegExp(email, "i"); // case-insensitive regex
      const users = await userCollection
        .find({ email: { $regex: regex } })
        .project({ email: 1, role: 1, create_at: 1 }) // only return necessary fields
        .toArray();

      if (!users.length) {
        return res.status(404).send({ message: "No users found" });
      }

      res.send(users);
    });
    // Body: { email: "user@example.com", role: "admin" } or "user"
    app.patch("/users/role", async (req, res) => {
      const { email, role } = req.body;

      if (!email || !role) {
        return res.status(400).send({ message: "Email and role are required" });
      }

      try {
        const result = await userCollection.updateOne(
          { email },
          { $set: { role } }
        );

        res.send(result);
      } catch (err) {
        res.status(500).send({ message: "Failed to update role" });
      }
    });

    // backend/routes/parcels.js or similar
    const { ObjectId } = require("mongodb");

    app.patch("/parcels/update-status/:id", async (req, res) => {
      const { id } = req.params;
      const { delivery_status } = req.body;

      console.log("Received delivery_status:", delivery_status);
      console.log("Parcel ID:", id);

      try {
        const parcelBefore = await parcelCollection.findOne({
          _id: new ObjectId(id),
        });

        if (!parcelBefore) {
          return res.status(404).send({ message: "Parcel not found" });
        }

        const updateFields = {
          delivery_status,
        };

        if (delivery_status === "delivered") {
          updateFields.delivery_time = new Date();
        }

        console.log("Update fields:", updateFields);

        const result = await parcelCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateFields }
        );

        console.log("Update result:", result);

        if (result.modifiedCount === 0) {
          return res.status(200).send({
            success: true,
            message: "No changes made (already up to date)",
          });
        }

        res.send({ success: true, message: "Status updated successfully" });
      } catch (error) {
        console.error("Error updating status:", error);
        res.status(500).send({ message: "Internal Server Error" });
      }
    });

    // payment info get
    // app.get("/admin/payments", async (req, res) => {
    //   try {
    //     const result = await paymentsCollection
    //       .find()
    //       .sort({ paid_at: -1 }) // descending order
    //       .toArray();

    //     res.send(result);
    //   } catch (error) {
    //     console.error("Error fetching payment history:", error);
    //     res
    //       .status(500)
    //       .send({ success: false, message: "Internal Server Error" });
    //   }
    // });

    // get logged in user payment history

    app.get("/payments", verifyFBToken, async (req, res) => {
      const email = req.query.email;

      if (req.user.email !== email) {
        return res.status(403).send({ message: "forbidden access" });
      }

      if (!email) {
        return res
          .status(400)
          .send({ success: false, message: "Email is required" });
      }

      try {
        const result = await paymentsCollection
          .find({ userEmail: email }) // <-- ✅ filter by user email
          .sort({ paid_at: -1 })
          .toArray();

        res.send({ success: true, data: result });
      } catch (error) {
        console.error("Error fetching payment history by email:", error);
        res
          .status(500)
          .send({ success: false, message: "Internal Server Error" });
      }
    });

    app.delete("/parcels/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const result = await parcelCollection.deleteOne(query);
      if (result.deletedCount === 1) {
        res.send({ success: true, message: "Product deleted successfully" });
      } else {
        res.status(404).send({ success: false, message: "Product not found" });
      }
    });

    app.get("/tracking/:tracking_id", async (req, res) => {
      const { tracking_id } = req.params;

      try {
        const updates = await trackingCollection
          .find({ tracking_id })
          .sort({ timestamp: -1 }) // Most recent first
          .toArray();

        if (!updates.length) {
          return res
            .status(404)
            .send({ success: false, message: "Tracking ID not found" });
        }

        res.send({ success: true, data: updates });
      } catch (error) {
        console.error("Error fetching tracking updates:", error);
        res
          .status(500)
          .send({ success: false, message: "Internal Server Error" });
      }
    });

    // routes/payments.js
    app.get("/parcels/:id", async (req, res) => {
      const { id } = req.params;

      try {
        const parcel = await parcelCollection.findOne({
          _id: new ObjectId(id),
        });

        if (!parcel) {
          return res.status(404).json({ message: "Parcel not found" });
        }

        res.json(parcel);
      } catch (error) {
        res
          .status(500)
          .json({ message: "Error fetching parcel", error: error.message });
      }
    });

    app.post("/riders", verifyFBToken, async (req, res) => {
      try {
        const rider = req.body;
        rider.created_at = new Date().toISOString();

        const result = await ridersCollection.insertOne(rider);
        res.status(201).send({ insertedId: result.insertedId });
      } catch (error) {
        console.error("Error inserting rider:", error);
        res.status(500).send({ error: "Failed to add rider" });
      }
    });
    // user find
    app.post("/users", async (req, res) => {
      const email = req.body.email;
      const userExists = await userCollection.findOne({ email });

      if (userExists) {
        return res
          .status(200)
          .send({ message: "User already exists", inserted: false });
      }

      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    app.post("/create-payment-intent", async (req, res) => {
      const amountInCents = req.body.amountInCents;
      try {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amountInCents,
          currency: "usd",
          payment_method_types: ["card"],
        });

        res.send({ clientSecret: paymentIntent.client_secret });
      } catch (error) {
        console.error("❌ Stripe Error:", error.message);
        res.status(500).send({ error: error.message });
      }
    });

    app.post("/payments", async (req, res) => {
      try {
        const { parcelId, transactionId, amount, userEmail } = req.body;

        // Update the parcel's payment status to "paid"
        const updateResult = await parcelCollection.updateOne(
          { _id: new ObjectId(parcelId) },
          { $set: { payment_status: "paid" } }
        );

        // Insert payment history
        const paymentRecord = {
          parcelId,
          transactionId,
          amount,
          userEmail,
          paid_at_string: new Date().toISOString(),
          paid_at: new Date(),
        };

        const insertResult = await paymentsCollection.insertOne(paymentRecord);

        res.send({
          success: true,
          message: "Payment recorded successfully",
          updateResult,
          insertResult,
        });
      } catch (error) {
        console.error("Error processing payment:", error);
        res
          .status(500)
          .send({ success: false, message: "Internal Server Error" });
      }
    });

    app.post("/tracking", async (req, res) => {
      try {
        const { tracking_id, parcelId, status, location } = req.body;

        const newUpdate = {
          tracking_id,
          parcelId,
          status,
          location,
          timestamp: new Date(),
        };

        const result = await trackingCollection.insertOne(newUpdate);
        res.send({ success: true, message: "Tracking update added", result });
      } catch (error) {
        console.error("Error inserting tracking update:", error);
        res
          .status(500)
          .send({ success: false, message: "Internal Server Error" });
      }
    });

    // Example route: insert a parcel
    app.post("/parcels", async (req, res) => {
      try {
        const parcel = req.body;
        const result = await parcelCollection.insertOne(parcel);
        res.status(201).send(result); // 201 = Created
      } catch (error) {
        console.error("❌ Failed to insert parcel:", error.message);
        res.status(500).send({ error: "Failed to insert parcel" });
      }
    });
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
  }
}

run().catch(console.dir);

// Root route
app.get("/", (req, res) => {
  res.send("📦 Parcel Server is running and MongoDB is smiling.");
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server is listening on port ${port}`);
});
