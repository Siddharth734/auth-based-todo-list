const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const User = new Schema({
    username: {type:String, unique: true},
    email: {type:String, unique: true},
    password: String
});

const Task = new Schema({
    title: String,
    completed: Boolean,
    userId: ObjectId
},{
    timestamps: true
});

const UserModel = mongoose.model('users',User);
const TaskModel = mongoose.model('tasks',Task);

module.exports = {
    UserModel,
    TaskModel
}