import {config} from 'dotenv'
import mongoose from 'mongoose'
import * as States from './states.controller'

config()

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true })

async function app(){
    const result = await States.index()
    return result
}

app()