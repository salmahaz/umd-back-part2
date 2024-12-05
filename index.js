import express from 'express';
import fs from "fs";
import path from "path";
import cors from "cors";

const Port = 3500;  

const app = express();


const usersFilePath = 'C:\\Users\\hazhaz\\u-m-d\\umd-back\\data\\users.json';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

            
            const updatedData = { users: users }; // Wrap the users array in an object
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


app.put('/users/:id', (req, res) => {
    const id = req.params.id;
    const updatedUser = req.body;

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

        
        users[userIndex] = { ...users[userIndex], ...updatedUser };

        
        if (!updatedUser.name || !updatedUser.email || !updatedUser.phone) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

      
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

        let users = data ? JSON.parse(data) : [];

       
        const userIndex = users.findIndex(user => user.id === userId);

        if (userIndex === -1) {
            return res.status(404).json({ error: 'User not found' });
        }

       
        users.splice(userIndex, 1);

        fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), 'utf8', (writeErr) => {
            if (writeErr) {
                console.error(writeErr);
                return res.status(500).json({ error: 'Failed to update users file' });
            }

            res.status(200).json({ message: 'User deleted successfully' });
        });
    });
});


app.listen(Port, () => {
    console.log('Server running on http://localhost:3500');
});