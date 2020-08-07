import Queue, { QueueOptions } from 'bull'
import 'dotenv/config'

import job from './job'

const redisConfig: QueueOptions = {
    redis:{
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT)
    }
}

console.log(redisConfig)

const jobsQueue = new Queue(job.key, redisConfig)

export default jobsQueue