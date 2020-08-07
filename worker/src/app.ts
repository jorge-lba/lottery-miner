import Queue from './Queue'
import job from './job'

import 'dotenv/config'

Queue.process(job.handle)
