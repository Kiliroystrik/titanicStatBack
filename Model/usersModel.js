import mongoose from 'mongoose';
const { Schema, model } = mongoose;

export const UsersSchema = new Schema({
    email: String,
    password: String,
});

export const UsersModel = mongoose.model("users", UsersSchema);