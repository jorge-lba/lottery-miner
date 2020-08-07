import { Schema } from 'mongoose'

const StateSchema = new Schema({
    state:String,
    citys:[String]
})

export { StateSchema }