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

const insertSchema = joi.object({
    value: joi.number().required(),
    description: joi.string().required(),
    type: joi.string().valid("credit", "debit").required(),

})


async function insert(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const { description, value, type } = req.body;
        
    const isValid = insertSchema.validate({
        value, description, type
    })
    if (isValid.error) {
        return res.sendStatus(400)
    }
    if (!token) {
        return res.send(400)
    }
    try {
        const session = await db.collection("user_token").findOne({
            token,
        });
        if (!session) {
            return res.send(401)
        }
        const user = await db.collection("users").findOne({
            _id: session.userId

        });
        res.locals.session = session;
        res.locals.session = user;
        db.collection('transactions').insertOne({
            description,
            value,
            type,
            userId: session.userId
        });
        return res.send(201)
        next()
    } catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
}


async function listTransictions(req, res) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const { description, value, type } = req.body;
    const { user } = res.locals;

    
    const isValid = insertSchema.validate({
        value, description, type
    })
    if (isValid.error) {
        return res.sendStatus(400)
    }
    if (!token) {
        return res.send(400)
    }
    try {
        const session = await db.collection("user_token").findOne({
            token,
        });
        if (!session) {
            return res.send(401)
        }
        const user = await db.collection("users").findOne({
            _id: session.userId

        });
        res.locals.session = session;
        res.locals.session = user;
        db.collection('transactions').findOne({
            userId: user._id,
        });
        const sum = transactions.reduce((account, trans) => {
            if (trans.type === debit) {
                return account - trans.value;
            }
            return account + trans.value;
        }, 0);

        transactions.push({
            type: 'total',
            value: sum,
        });
        return res.send(transactions);
    } catch (error) {
        console.log(error);
        return res.send(400);
    }
}
export { insert, listTransictions }