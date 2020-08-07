import Queue, { QueueOptions } from 'bull'
import 'dotenv/config'

import jobs from './jobs'

const host:string = process.env.REDIS_HOST
const port:number = parseInt(process.env.REDIS_PORT)

console.log(host, port)

const redisConfig:QueueOptions = {
    redis:{
        host,
        port
    }
}

const jobsQueue = new Queue(jobs.key, redisConfig)

export default jobsQueue