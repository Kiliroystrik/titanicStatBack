import mongoose from 'mongoose';
const { Schema, model } = mongoose;

export const PassengersSchema = new Schema({

    PassengerId: String,
    Survived: String,
    Pclass: String,
    Name: String,
    Sex: String,
    Age: String,
    SibSp: String,
    Parch: String,
    Ticket: String,
    Fare: String,
    Embarked: String,
});

export const PassengersModel = mongoose.model("passengers", PassengersSchema);