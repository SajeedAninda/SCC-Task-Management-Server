require('dotenv').config()
const express = require('express')
let cors = require("cors");
const app = express()

app.use(cors({
    origin: ['https://task-management-sajeed.netlify.app', 'http://localhost:5173', 'http://localhost:5174']
}));
app.use(express.json());

const port = 5000


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `${process.env.MONGO_URI}`;

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
        // await client.connect();
        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        const tasksCollection = client.db("TaskManagement").collection("tasks");

        //Add new tasks to taskCollection

        app.post("/createTask", async (req, res) => {
            const tasks = req.body;
            const result = await tasksCollection.insertOne(tasks);
            res.send(result);
        });

        // GET TASKS BY SPECIFIC USER 

        app.get("/getTasks/:email", async (req, res) => {
            const email = req.params.email;
            const query = {
                email: email
            };
            const result = await tasksCollection.find(query).toArray();
            res.send(result);
        });

        // UPDATE TASK STATUS 
        app.patch('/updateTask/:id', async (req, res) => {
            const taskId = req.params.id;
            const newStatus = req.body.status;

            if (!ObjectId.isValid(taskId)) {
                return res.status(400).json({ error: 'Invalid Task ID' });
            }

            const updatedTask = await tasksCollection.findOneAndUpdate(
                { _id: new ObjectId(taskId) },
                { $set: { status: newStatus } },
                { returnDocument: 'after' }
            );

            if (!updatedTask.value) {
                return res.status(404).json({ error: 'Task not found' });
            }

            res.json({ message: 'Task updated successfully', updatedTask: updatedTask.value });
        });

        // DELETE TASK FROM DASHBOARD 
        app.delete("/deleteTask/:id", async (req, res) => {
            const id = req.params.id;
            const query = {
                _id: new ObjectId(id),
            };
            const result = await tasksCollection.deleteOne(query);
            res.send(result);
        });

        //   GET SINGLE TASK BY ID 
        app.get("/getTaskbyId/:id", async (req, res) => {
            const id = req.params.id;
            const query = {
                _id: new ObjectId(id),
            };
            const result = await tasksCollection.findOne(query);
            res.send(result);
        });

        // UPDATE SINGLE DATA 
        app.put("/updateTask/:id", async (req, res) => {
            const id = req.params.id;
            const taskData = req.body;
            console.log(id);
            console.log(taskData)
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatedData = {
                $set: {
                    title: taskData.title,
                    description: taskData.description,
                    deadline: taskData.deadline,
                    priority: taskData.priority,
                },
            };
            const result = await tasksCollection.updateOne(
                filter,
                updatedData,
                options
            );
            res.send(result);
        });


        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Task Management Server!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})