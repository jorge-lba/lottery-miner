import mongoose from 'mongoose'

import { StateSchema } from './states.schema'

const States = mongoose.model('State', StateSchema)

async function index(){
    const states = await States.find()
    return states
}

async function create(stateData:any){
    const state = await States.create(stateData)
    return state
}