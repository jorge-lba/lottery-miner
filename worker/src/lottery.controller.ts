import mongoose from 'mongoose'

import { LotterySchema } from './lottery.schema'

const Lottery = mongoose.model('Lottery', LotterySchema)

async function index(){
    const lottery = await Lottery.find()
    return lottery
}

async function create(lotteryData:any){
    const lottery = await Lottery.create(lotteryData)
    return lottery
}

export { index, create }