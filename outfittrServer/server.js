require('dotenv').config(); // 1. CRITICAL: Load your .env file
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

// Connect once when the server starts
client.connect().then(() => console.log("Connected to MongoDB"));

// --- API Routes ---

app.post('/api/additem', async (req, res) => {
    const { userId, item } = req.body;
    const newItem = { Item: item, UserId: userId };
    
    try {
        const db = client.db('OutfittrDB');
        // 2. Added 'await' so the record actually saves before we respond
        await db.collection('Items').insertOne(newItem);
        res.status(200).json({ error: '' });
    } catch (e) {
        res.status(500).json({ error: e.toString() });
    }
});

app.post('/api/login', async (req, res) => {
    const { login, password } = req.body;
    
    try {
        const db = client.db('OutfittrDB');
        const user = await db.collection('Users').findOne({ Login: login, Password: password });

        if (user) {
            res.status(200).json({ 
                id: user.UserID, // Ensure your DB field is 'UserID' and not '_id'
                firstName: user.FirstName, 
                lastName: user.LastName, 
                error: '' 
            });
        } else {
            res.status(401).json({ error: 'Invalid login/password' });
        }
    } catch (e) {
        res.status(500).json({ error: e.toString() });
    }
});

app.post('/api/searchitems', async (req, res) => {
    const { userId, search } = req.body;
    const _search = search.trim();
    
    try {
        const db = client.db('OutfittrDB');
        const results = await db.collection('Items')
            .find({ "Item": { $regex: _search + '.*', $options: 'i' } })
            .toArray();

        // Use .map() for a cleaner way to extract just the item names
        const itemNames = results.map(doc => doc.Item);
        res.status(200).json({ results: itemNames, error: '' });
    } catch (e) {
        res.status(500).json({ error: e.toString() });
    }
});

app.listen(5000, () => console.log("Server running on port 5000"));


// const MongoClient = require('mongodb').MongoClient;
// const uri = process.env.MONGODB_URI;
// const client = new MongoClient(uri);
// client.connect();

// const express = require('express');
// const cors = require('cors');
// const app = express();

// app.use(cors());
// app.use(express.json());
// app.use((req, res, next) => {
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader(
//         'Access-Control-Allow-Headers',
//         'Origin, X-Requested-With, Content-Type, Accept, Authorization'
//     );
//     res.setHeader(
//         'Access-Control-Allow-Methods',
//         'GET, POST, PATCH, DELETE, OPTIONS'
//     );
//     next();
// });

// app.listen(5000); // start Node + Express server on port 5000


// app.post('/api/additem', async (req, res, next) => {
//     // incoming: userId, color
//     // outgoing: error
//     const { userId, item } = req.body;
//     const newItem = { Item: item, UserId: userId };
//     var error = '';
//     try {
//         const db = client.db('OutfittrDB');
//         const result = db.collection('Items').insertOne(newItem);
//     }
//     catch (e) {
//         error = e.toString();
//     }
//     // Note: ensure itemList is defined globally if you intend to use it here
//     if (typeof itemList !== 'undefined') itemList.push(item); 
    
//     var ret = { error: error };
//     res.status(200).json(ret);
// });


// app.post('/api/login', async (req, res, next) => {
//     // incoming: login, password
//     // outgoing: id, firstName, lastName, error
//     var error = '';
//     const { login, password } = req.body;
//     const db = client.db('OutfittrDB');
//     const results = await
//         db.collection('Users').find({ Login: login, Password: password }).toArray();
//     var id = -1;
//     var fn = '';
//     var ln = '';
//     if (results.length > 0) {
//         id = results[0].UserID;
//         fn = results[0].FirstName;
//         ln = results[0].LastName;
//     }
//     var ret = { id: id, firstName: fn, lastName: ln, error: '' };
//     res.status(200).json(ret);
// });


// app.post('/api/searchitems', async (req, res, next) => {
//     // incoming: userId, search
//     // outgoing: results[], error
//     var error = '';
//     const { userId, search } = req.body;
//     var _search = search.trim();
//     const db = client.db('OutfittrDB');
//     const results = await db.collection('Items').find({ "Item": { $regex: _search + '.*', $options: 'i' } }).toArray();
//     var _ret = [];
//     for (var i = 0; i < results.length; i++) {
//         _ret.push(results[i].Item);
//     }
//     var ret = { results: _ret, error: error };
//     res.status(200).json(ret);
// });
