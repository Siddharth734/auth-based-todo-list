const express = require('express');
const fs = require('fs').promises;
const path = require('path')
const jwt = require('jsonwebtoken');
require('dotenv').config();
const app = express();
const JWT_SECRET = process.env.JWT_SECRET;
const PORT = process.env.PORT || 3006;

function auth(req,res,next) {
    const token = req.headers.authorization;

    if(token){
        jwt.verify(token,JWT_SECRET,(err,decoded) => {
            if(err){
                res.status(401).send({
                    message: "Unauthorized User"
                })
            }else{
                req.user = decoded;
                next();
            }
        })

    }else{
        res.status(401).send({
            message: "Invalid User"
        })
    }
}
//verifies if a user is logged in and ends the request early if the user isn’t logged in

app.use(express.json());
app.use(express.static('public')); // to run files like js and css

// const users = [];

async function readData() {
    try{
        const data = await fs.readFile('data.json', 'utf-8');
        const parsedData = JSON.parse(data);
        return Array.isArray(parsedData)?parsedData:[];
    }catch(err){
        return [];
    }
}

async function writeData(myData) {
    try{
        await fs.writeFile('data.json',JSON.stringify(myData, null, 2));
    }catch(err){
        console.log(`Error saving data to the file: ${err}`);
    }
}

function newidGenerator(user){
    if(user.tasks.length>0){
        let index = user.tasks[user.tasks.length-1];
        index = index.id.split("t");
        return `t${parseInt(index[1])+1}`;
    }else{
        return 't1';
    }
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
})

app.post('/signup', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const users = await readData();

    if(users.find(u => u.username === username)){
        res.json({
            message: "You are already signed up"
        })
        return;
    }

    users.push({
        username: username,
        password: password,
        tasks: []
    })
    console.log(users);

    await writeData(users);

    res.json({
        message: "You are signed up now"
    })
})

app.post('/signin', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const users = await readData();

    const user = users.find(u => u.username === username && u.password === password)

    if(user){
        const token = jwt.sign({
            username: username
        }, JWT_SECRET);

        res.json({
            token: token
        })
    }else{
        res.status(403).send({
            message: "Invalid User!"
        })
    }
})

app.get('/me', auth, (req, res) => {
    const user = req.user;

    res.json({
        username: user.username
    })
});

app.post('/todos',auth, async (req,res) =>{
    try{
        const user = req.user;
        const newTask = req.body.task;
        const users = await readData();
        const findUser = users.find(u => u.username === user.username)

        findUser.tasks.push({
            title: newTask,
            id: newidGenerator(findUser),
            completed: false,
            createdOn: new Date().toISOString()
        })

        await writeData(users)

        res.json({
            message: "task was sucessfully added"
        })
    }catch(error){
        res.json({
            message: "error adding the task " + error
        })
    }
});

app.get('/todos',auth, async (req,res) =>{
    try{
        const user = req.user;
        const users = await readData();
        const findUser = users.find(u => u.username === user.username)
    
        res.json({
            tasks: findUser.tasks
        })
    }catch(error){
        res.json({
            message: `error loading up tasks: ${error}`
        })
    }
});

app.delete('/todos',auth, async (req,res) =>{
    try {
        const user = req.user;
        const users = await readData();
        const index = req.body.id;

        if(!index){ 
            res.json({
                message: "Task is is required"
            })
            return;
        }

        const findUser = users.find(u => u.username === user.username);
        findUser.tasks = findUser.tasks.filter(f => f.id != index);

        await writeData(users);
        
        res.json({
            message: `task at ${index} was deleted for user: ${findUser.username}`
        })
    } catch (error) {
        res.json({
            message: `error deleting the task: ${error}`
        })
    }
});

app.put('/todos',auth, async (req,res) =>{
    
    try {
        const user = req.user;
        const users = await readData();
        const newTask = req.body.task;
        const update = req.body.update;
        const index = req.body.id;
    
        if(!index){
            res.json({
                message: "id is required"
            })
            return;
        }
    
        const findUser = users.find(u => u.username === user.username);
    
        findUser.tasks.forEach(t => {
            if(t.id === index){
                t.title = newTask;
                t.updatedOn = update;
            }
        });

        await writeData(users);

        res.json({
            message:"task updated"
        })
    } catch (error) {
        res.json({
            message: `error: ${error}`
        })
    }
});

app.patch('/todos',auth, async (req,res) =>{
    try {
        const user = req.user;
        const users = await readData();
        const index = req.body.id;

        if(!index){
            res.json({
                message: "index is required"
            })
            return;
        }

        const findUser = users.find(u => u.username === user.username)

        findUser.tasks.forEach(t => {
            if(t.id === index){
                t.completed = !t.completed;
            }
        });

        await writeData(users);

        res.json({
            message: "marked"
        })
    } catch (error) {
        res.json({
            message: `error marking: ${error}`
        })
    }
});

app.listen(PORT, () => {
    console.log(`Server running on: http://localhost:${PORT}`);
})