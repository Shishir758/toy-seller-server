const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config()

const port = process.env.PORT || 5000;

app.use(cors());;
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@cluster0.svs1tmw.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    
    const myDB = client.db("myDB");
    const myColl = myDB.collection("products");

    // Creating index on two fields
    const indexKeys = { name: 1 }; // Replace field1 and field2 with your actual field names
    const indexOptions = { name1: "toyname" }; // Replace index_name with the desired index name
    const result = await myColl.createIndex(indexKeys, indexOptions);

    app.get("/searchToy/:text", async (req, res) => {
      const searchText = req.params.text;
      const result = await myColl
        .find({
          $or: [
            { name: { $regex: searchText, $options: "i" } },

          ],
        })
        .toArray();
      res.send(result);
    });

    //email access route created
    app.get('/products/:email', async (req, res) => {
      console.log(req.params.email);
      const result = await myColl.find({ sellerEmail: req.params.email }).toArray();
      res.send(result)
    })

    //all data fetch route created
    app.get('/products', async (req, res) => {
      const cursor = myColl.find()
      const result = await cursor.toArray();
      res.send(result);
    })

    //get data by id route created
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await myColl.findOne(query);
      res.send(result)

    });

    //updateOne route created
    app.put('/products/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateInfo = req.body;
      const updateField = {
        $set: {
          price: updateInfo.price,
          quantity: updateInfo.quantity,
          description: updateInfo.description
        }
      };
      const result = await myColl.updateOne(query, updateField, options);
      res.send(result);
    });

    //deletedOne route created
    app.delete('/products/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await myColl.deleteOne(query);
      res.send(result)
    })

    //InsertOne route created
    app.post('/products', async (req, res) => {
      const toy = req.body;
      const result = await myColl.insertOne(toy);
      console.log(result);

    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('running .................')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})