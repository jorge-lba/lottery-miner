import {config} from 'dotenv'
import mongoose, { connection } from 'mongoose'
import * as States from './states.controller'
import Queue from './queue'

config()

type StateData = {
    state:string,
    citys:[string]
}

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true })

async function app(){
    const result:StateData[] = Object.assign(await States.index())
    for(const element of result){
        console.log(element.state, " - ", element.citys.length, 'cidades')
        await Queue.add(element)
    }
}

app()