import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import joi from 'joi';
import { MongoClient } from "mongodb";
import { signUp, signIn} from './authController.js'
import {insert} from './transitionsController.js'

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;
mongoClient.connect().then(() => {
	db = mongoClient.db("my_wallet");
});

app.post('/signUp/',signUp);
app.post('/signIn/',signIn);
app.post('/transactions/',insert);
app.listen(5000, () => console.log("Rodando a porta 5000. Sucesso!!!"))