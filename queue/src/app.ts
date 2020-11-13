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
        const maxCitysByArray = 100
        if(element.citys.length > maxCitysByArray){
            const division = Math.ceil(element.citys.length/maxCitysByArray)-1
            for(let i = 0; i <= division; i++){
                const initPosition = i*maxCitysByArray
                const endPosition = (i+1)*maxCitysByArray
                const dataCitys = element.citys.slice(initPosition, endPosition)
                console.log(element.state, ' - ', dataCitys.length)
                await Queue.add({
                    state:element.state,
                    citys:dataCitys
                })
            }
        }else{
            console.log(element.state, " - ", element.citys.length, 'cidades')
            await Queue.add(element)
        }
    }
}

app()