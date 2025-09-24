const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const User = new Schema({
    username: {type:String, unique:True},
    email: String,
    password: String
});

const Task = new Schema({
    title: String,
    completed: Boolean,
    createdOn: String,
    updatedOn: String
});

const UserModel = mongoose.model('users',User);
const TaskModel = mongoose.model('tasks',Task);

module.exports = {
    UserModel,
    TaskModel
}