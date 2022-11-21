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

const userSchema = joi.object({
    name: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().required(),

})

const userSignInSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().required(),

})

async function signUp(req, res) {
    const { name, email, password } = req.body;
    const isUser = userSchema.validate({
        name, email, password
    })
    if (isUser.error) {
        return res.sendStatus(400)
    }
    const passwordEnc = bcrypt.hashSync(password, 2)

    try {
        const user = await db.collection("users").insertOne({
            name,
            email,
            password: passwordEnc,

        });
        return res.sendStatus(201)
    } catch (err) {
        console.error(err)
        return res.sendStatus(500)
    }
}



async function signIn(req, res) {
    const { email, password } = req.body;

    const isUser = userSignInSchema.validate({
        email, password
    })
    if (isUser.error) {
        return res.sendStatus(400)
    } try {
        const user = await db.collection("users").findOne({
            email,
        });
        const passwordValid = bcrypt.compareSync(password, user.password);

        if (!user || !passwordValid) {
            return res.send(401);
        }
        const token = uuid()
        db.collection("user_token").insertOne({
            userId: user._id,
            token,
        })
        return res.send(token)
    } catch {
        return res.sendStatus(500)
    }
}
export { signUp, signIn }

