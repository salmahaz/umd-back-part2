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

app.use(cors());
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
        let userExists = false;
        if (data) {
            try {
                const jsonData = JSON.parse(data);
                users = jsonData.users || [];

                userExists = users.some(
                    (user) => user.id === id || user.username === username || user.email === email
                );

            } catch (e) {
                console.error("Error parsing JSON:", e);
                return res.status(500).json({ error: 'Invalid JSON format in users file' });
            }
        }

        if (userExists) {
            return res.status(400).json({
                msg: 'User with this Id, Username, or Email already exists. Please try again.'
            });
        } else {
            users.push(newUser);

            const updatedData = { users: users };
            fs.writeFile(usersFilePath, JSON.stringify(updatedData, null, 2), 'utf8', (writeErr) => {
                if (writeErr) {
                    console.error(writeErr);
                    return res.status(500).json({ error: 'Failed to update users file' });
                }

                res.status(200).json({ message: 'User added successfully' });
            });
        }
    });
});

app.listen(Port, () => {
    console.log(`Server running on http://localhost:${Port}`);
});
