const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const jwt = require('jsonwebtoken');
const { UserModel, TaskModel } = require("./db");
const { auth, JWT_SECRET } = require("./auth");
const mongoose = require('mongoose');
require('dotenv').config();

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const app = express();
const PORT = process.env.PORT || 3007;

async function startServer() {
    try {
        await mongoose.connect(process.env.Mongo_Connector);
        app.listen(PORT, () => {
            console.log(`Starting server on: http://localhost:${PORT}`);
        });
    } catch (error) {
        console.log(`Error occured while trying to start the server: ${error}`);
    }
}

app.use(express.json());
app.use(express.static('public')); // to run files like js and css

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
})

app.post('/signup', async (req, res) => {
    try {
        const username = req.body.username;
        const email = req.body.email;
        const password = req.body.password;
        
        await UserModel.create({
            username: username,
            email: email,
            password: password
        })
        console.log(UserModel);
    
        res.json({
            message: "You are signed up now"
        })
    } catch (error) {
        res.json({
            message: `error signing up: ${error}`
        })
    }
});

app.post('/signin', async (req, res) => {
    try {
        const username = req.body.username;
        const password = req.body.password;
    
        const user = await UserModel.findOne({
            username: username,
            password: password
        });
    
        if(user){
            const token = jwt.sign({
                id: user._id.toString()
            },JWT_SECRET);
    
            res.json({
                token: token
            });
        }else{
            res.json({
                message: "Invalid User"
            })
        }
    } catch (error) {
        res.status(403).json({
            message: `Error occured while trying to login: ${error}`
        });
    }
});

app.get('/me', auth, async (req, res) => {
    try {
        const id = req.id;
    
        const user = await UserModel.findOne({
            _id: id
        });
    
        if(user){
            res.json({
                username: user.username
            })
        }else{
            res.json({
                message: "Invalid User id, user not found"
            })
        }
        
    } catch (error) {
        res.status(403).json({
            message: `Error occured while trying to fetch user details: ${error}`
        });
    }
});

app.post('/todos',auth, async (req,res) =>{
    try{
        const id = req.id;
        const newTask = req.body.task;

        await TaskModel.create({
            title: newTask,
            completed: false,
            userId: id
        })

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
        const id = req.id;

        //findOne({}) returns Single document object or null, whereas
        // find({}) return Returns: Array of documents (even if empty or has one item)
        const tasks = await TaskModel.find({
            userId: id
        });
        res.json({
            tasks: tasks
        })
    }catch(error){
        res.json({
            message: `error loading up tasks: ${error}`
        })
    }
});

app.delete('/todos',auth, async (req,res) =>{
    try {
        const userId = req.id;
        const taskId = req.body.id;

        if(!taskId){ 
            res.json({
                message: "Task is is required"
            })
            return;
        }

        await TaskModel.deleteOne({
            _id: taskId,
            userId: userId
        });
        
        res.json({
            message: `task at was deleted`
        })
    } catch (error) {
        res.json({
            message: `error deleting the task: ${error}`
        })
    }
});

app.put('/todos',auth, async (req,res) =>{
    
    try {
        const userId = req.id;
        const newTask = req.body.task;
        const taskId = req.body.id;
    
        if(!taskId){
            res.json({
                message: "id is required"
            })
            return;
        }
    
        // const task = await TaskModel.find({
        //     _id: taskId,
        //     userId: userId
        // });

        await TaskModel.updateOne({
            _id: taskId },
            {
                $set: {
                    title: newTask
                }
        });
        //without $set it replaces whole doc, but with it it safely adds/updates it

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
        const userId = req.id;
        const taskId = req.body.id;

        if(!taskId){
            res.json({
                message: "index is required"
            })
            return;
        }

        const task = await TaskModel.findOne({
            _id: taskId,
            userId: userId
        });
        
        const completed = task.completed?false:true

        await TaskModel.updateOne(
            {  _id: taskId },
            { $set: { completed: completed } }
        );

        res.json({
            message: "marked"
        })
    } catch (error) {
        res.json({
            message: `error marking: ${error}`
        })
    }
});

startServer();