import { Schema } from 'mongoose'

const LotterySchema = new Schema({
    name:String, 
    street:String, 
    neighborhood:String, 
    zip:String, 
    city:String, 
    uf:String, 
    phone:String, 
    agencyNumber:String 
})

export { LotterySchema }