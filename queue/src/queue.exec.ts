import {config} from 'dotenv'

config()

import Queue from './queue'
import jobs from './jobs'

Queue.process(jobs.handle) 