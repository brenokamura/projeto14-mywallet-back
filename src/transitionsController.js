import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import joi from 'joi';
import bcrypt from 'bcrypt';
import { MongoClient } from "mongodb";
import { v4 as uuid } from 'uuid';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;
mongoClient.connect().then(() => {
	db = mongoClient.db("my_wallet");
});



async function insert(req, res) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const { description, value, type } = req.body;
    if(!token){
        return res.send(400)
    }
    try {
        const session = await db.collection("user_token").findOne({
    token,
    });
    if(!session){
        return res.send(401)
    }
    db.collection('transactions').insertOne({
    description, 
    value, 
    type,
    userId: session.userId
    });
    return res.send(201)
    } catch (err) {
    console.log(err);
    return res.sendStatus(500);
    }
    }
    
  export {insert}