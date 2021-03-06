import { launch, Page} from 'puppeteer'
import { PendingXHR } from 'pending-xhr-puppeteer'
import mongoose from 'mongoose'
import 'dotenv/config'
import * as Lottery from './lottery.controller'

const selectorID = '#ctl00_ctl58_g_7fcd6a4b_5583_4b25_b2c4_004b6fef4036_'
const url = 'http://www.caixa.gov.br/atendimento/Paginas/encontre-a-caixa.aspx'

const selectOption = selectorID + 'ddlTipo'
const selectState = selectorID + 'ddlUf'
const selectCity = selectorID + 'ddlCidade'
const buttonSearch = selectorID + 'btnBuscar'

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}

function getRandomArbitrary(min, max) {
    return parseInt(Math.random() * (max - min) + min);
}

function formatData(data:string){
    try {
        const dataSplit = data.split('\n')
        .filter(element => element !== '')

        const name = dataSplit[0]
        const [ street, neighborhood ] = dataSplit[1].split(' - ')
        const [ zip, city, uf ] = dataSplit[2].replace(', ', ' - ').split(' - ')
        const phone = dataSplit[3]?.replace('Tel: ', '')
        const agencyNumber = dataSplit[4]?.replace('Ag. Número: ', '')

        return {
            name, 
            street, 
            neighborhood, 
            zip, 
            city, 
            uf, 
            phone, 
            agencyNumber 
        }
    } catch (error) {
        console.log(data)
        return {name: '', error: 'error'}
    }
}

async function scraping(url:string, dataState){
    let valueRandom = getRandomArbitrary(1,10)
    await sleep(valueRandom*1000)
    console.log('inicio em ',valueRandom, ' ms')
    
    const browser = await launch({
        // headless: false, // Abrir Browser
        args:[
                '--no-sandbox',
                '--disable-setuid-sandbox'
            ]
    })

    const page = await browser.newPage()
    const pendingXHR = new PendingXHR(page)
    console.log('Pagina iniciada')

    await page.goto(url)
    await page.waitForFunction(() => true)
    await page.select(selectOption, '2')
    await pendingXHR.waitForAllXhrFinished()
    await sleep(getRandomArbitrary(100,300))

    await page.select(selectState, dataState.state)
    await page.waitForFunction(() => true)
    await pendingXHR.waitForAllXhrFinished()
    await sleep(getRandomArbitrary(100,300))

    for(const city of dataState.citys){

        let replay = false
        do{
            try {
                await page.select(selectCity, city)
                await page.waitForFunction(() => true)
                await pendingXHR.waitForAllXhrFinished()
                await sleep(getRandomArbitrary(200,400))
        
                await page.click(buttonSearch)
                await pendingXHR.waitForAllXhrFinished()
                await page.waitForFunction(() => true)
                await sleep(getRandomArbitrary(300,600))

                const arrayLottery = await page.evaluate( () => {
                    const notLotteryMsg = 'Nenhum ponto de atendimento foi localizado com os dados informados.'
        
                    const selectH4:any = document.querySelectorAll('h4')

                    if(selectH4[0]?.innerText === notLotteryMsg){
                        return '----- Não há Lotericas ----'
                    }else if(selectH4.length >= 1){
                                
                        const lottery:any = document.querySelectorAll('div.resultado-busca-item')
                        const arrayLottery = [ ...lottery ].map(element => element.innerText)
                        return arrayLottery
                    }else if(!selectH4[0]?.innerText){
                            return 'ERROR'
                    }
                } )
    
                if(arrayLottery === 'ERROR'){
                    replay = true
                    console.log(arrayLottery)
                    
                    await page.reload()
                    await page.goto(url)
                    await page.waitForFunction(() => true)
                    await page.select(selectOption, '2')
                    await pendingXHR.waitForAllXhrFinished()
                    await sleep(getRandomArbitrary(100,300))

                    await page.select(selectState, dataState.state)
                    await page.waitForFunction(() => true)
                    await pendingXHR.waitForAllXhrFinished()
                    await sleep(getRandomArbitrary(100,300))
                }else if(arrayLottery === '----- Não há Lotericas ----'){
                    replay = false
                    console.log('----- Não há Lotericas ----')
                }else{
                    replay = false
                    const lottery = arrayLottery.map(element => formatData(element))
                    for(const item of lottery){
                        await Lottery.create(item)
                        console.log( dataState.state, ' ', city, ' ', item.name)
                    }
                } 
            } catch (error) {
                console.log(error)
                console.log( '--- Reload ---' )
                replay = true
                
                await page.goto(url)
                await page.waitForFunction(() => true)
                await page.select(selectOption, '2')
                await pendingXHR.waitForAllXhrFinished()
                await sleep(getRandomArbitrary(100,300))

                await page.select(selectState, dataState.state)
                await page.waitForFunction(() => true)
                await pendingXHR.waitForAllXhrFinished()
                await sleep(getRandomArbitrary(100,300))
            }
            
        }while(replay)

    }
    await page.close()
    await browser.close()
}

export default {
    key:'queue',
    async handle(data){
        console.log('Iniciando.....')
        const dataState = data.data
        console.log(dataState.state)
        try {
            await mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true })
            await scraping(url, dataState)
            console.log('Fim.....')
        } catch (error) {
            console.log(error)
        }
        mongoose.disconnect()
    }
}
