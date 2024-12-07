import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const Port = 3500;
const app = express();


const usersFilePath = path.join(__dirname, 'data', 'users.json');
console.log(usersFilePath);

app.use(cors({
    origin: 'https://umd-front-last.vercel.app',  
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('OOPS');
});
app.get('/users', (req, res) => {
    fs.readFile(usersFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading JSON file:', err);
            return res.status(500).json({ error: 'Failed to read users' });
        }

        try {
            const users = JSON.parse(data); 
            res.status(200).json(users); 
        } catch (parseErr) {
            console.error('Error parsing JSON:', parseErr);
            res.status(500).json({ error: 'Invalid JSON format' });
        }
    });
});

app.post('/users', (req, res) => {
    const newUser = req.body;

    console.log("Received data:", req.body);

    const { id, username, email } = newUser;

    if (!id || !username || !email) {
        return res.status(400).json({ error: 'Missing required fields (id, username, or email)' });
    }
    fs.readFile(usersFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to read users file' });
        }

        let users = [];
        if (data) {
            try {
                const jsonData = JSON.parse(data);
                users = Array.isArray(jsonData.users) ? jsonData.users : [];
            } catch (e) {
                console.error("Error parsing JSON:", e);
                return res.status(500).json({ error: 'Invalid JSON format in users file' });
            }
        }
           
        const userExists = users.some(user => user.id === id);
        const usernameExists = users.some(user => user.username === username);
        const emailExists = users.some(user => user.email === email);

        if (userExists || usernameExists || emailExists) {
            const msg = [];
            if (userExists) msg.push('ID');
            if (usernameExists) msg.push('Username');
            if (emailExists) msg.push('Email');
            return res.status(400).json({
                msg: `User with this ${msg.join(', ')} already exists. Please try again.`,
            });
        }
        
       users.push(newUser);

        fs.writeFile(usersFilePath, JSON.stringify({ users }, null, 2), 'utf8', (writeErr) => {
            if (writeErr) {
                console.error(writeErr);
                return res.status(500).json({ error: 'Failed to save user' });
            }

            return res.status(200).json({
                message: 'User saved successfully'
                
            });
        });
    });
 
    
});


app.put('/users/:id', (req, res) => {
    const id = req.params.id;
    const updatedUser = req.body;

    const { Id, username, email } = updatedUser;

    if (!updatedUser.name || !updatedUser.email || !updatedUser.phone) {
        return res.status(400).json({ error: 'Missing required fields: name, email, and phone are required' });
    }

    console.log("Received data:", req.body);

    fs.readFile(usersFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to read users file' });
        }

        let users = [];
        if (data) {
            try {
                const jsonData = JSON.parse(data);
                users = Array.isArray(jsonData.users) ? jsonData.users : [];
            } catch (e) {
                console.error("Error parsing JSON:", e);
                return res.status(500).json({ error: 'Invalid JSON format in users file' });
            }
        }

        const userIndex = users.findIndex(user => user.id.toString() === id);

        if (userIndex === -1) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userExists = users.some(user => user.id === id);
        const usernameExists = users.some(user => user.username === username);
        const emailExists = users.some(user => user.email === email);

        if (userExists || usernameExists || emailExists) {
            const msg = [];
            if (userExists) msg.push('ID');
            if (usernameExists) msg.push('Username');
            if (emailExists) msg.push('Email');
            return res.status(400).json({
                msg: `User with this ${msg.join(', ')} already exists. Please try again.`,
            });
        }
        

        users[userIndex] = { ...users[userIndex], ...updatedUser };

        fs.writeFile(usersFilePath, JSON.stringify({ users }, null, 2), 'utf8', (writeErr) => {
            if (writeErr) {
                console.error(writeErr);
                return res.status(500).json({ error: 'Failed to save updated user' });
            }

            return res.status(200).json({
                message: 'User updated successfully',
                user: users[userIndex],
            });
        });
    });
});

app.delete('/users/:id', (req, res) => {
    const userId = req.params.id;

    fs.readFile(usersFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to read users file' });
        }

        let users = [];
        if (data) {
            try {
                const jsonData = JSON.parse(data);
                users = Array.isArray(jsonData.users) ? jsonData.users : [];
            } catch (e) {
                console.error('Error parsing JSON:', e);
                return res.status(500).json({ error: 'Invalid JSON format in users file' });
            }
        }

        const userIndex = users.findIndex(user => user.id.toString() === userId);

        if (userIndex === -1) {
            return res.status(404).json({ error: 'User not found' });
        }

        users.splice(userIndex, 1);

        fs.writeFile(usersFilePath, JSON.stringify({ users }, null, 2), 'utf8', (writeErr) => {
            if (writeErr) {
                console.error(writeErr);
                return res.status(500).json({ error: 'Failed to update users file' });
            }

            res.status(200).json({ message: 'User deleted successfully' });
        });
    });
});






app.listen(Port, () => {
    console.log(`Server running on http://localhost:${Port}`);
});
