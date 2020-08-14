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
    await page.select(selectOption, '2')
    await pendingXHR.waitForAllXhrFinished()
    await sleep(getRandomArbitrary(100,300))

    await page.select(selectState, dataState.state)
    await page.waitForFunction(() => true)
    await pendingXHR.waitForAllXhrFinished()
    await sleep(getRandomArbitrary(100,300))

    for(const city of dataState.citys){

        await page.select(selectCity, city)
        await page.waitForFunction(() => true)
        await pendingXHR.waitForAllXhrFinished()
        await sleep(getRandomArbitrary(100,300))

        await page.click(buttonSearch)
        await page.waitForFunction(() => true)
        await pendingXHR.waitForAllXhrFinished()
        await sleep(getRandomArbitrary(300,600))

        const arrayLottery = await page.evaluate( () => {
            const notLotteryMsg = 'Nenhum ponto de atendimento foi localizado com os dados informados.'

            const selectH4:any = document.querySelectorAll('h4')
            if(selectH4[0]?.innerText === notLotteryMsg) return '----- Não há Lotericas ----'
            if(!selectH4[0]?.innerText) return 'ERROR'

            const lottery:any = document.querySelectorAll('div.resultado-busca-item')
            const arrayLottery = [ ...lottery ].map(element => element.innerText)
            return arrayLottery
        } )
        
        if(arrayLottery === 'ERROR'){
            console.log(arrayLottery)
        }else if(arrayLottery === '----- Não há Lotericas ----'){
            console.log('----- Não há Lotericas ----')
        }else{
            const lottery = arrayLottery.map(element => formatData(element))
            for(const item of lottery){
                await Lottery.create(item)
                console.log( city, ' ', item.name)
            }
        }

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

// const dataState = {
//     uf: 'AC',
//     citys: ["ACRELANDIA", "ASSIS BRASIL", "AVELINO CHAVES", "BRASILEIA", "BUJARI", "CAMPINAS", "CAPIXABA", "CRUZEIRO DO SUL", "DIMPOLIS", "EPITACIOLANDIA", "FEIJO", "FRANCISCO CONDE", "HUGO CARNEIRO", "IRACEMA", "JOAO CANCIO", "JORDAO", "LEONCIO RODRIGUES", "MANCIO LIMA", "MANOEL URBANO", "MARECHAL THAUMATURGO", "MARIO LOBAO", "PLACIDO DE CASTRO", "PORTO ACRE", "PORTO WALTER", "RIO BRANCO", "RODRIGUES ALVES", "SANTA ROSA DO PURUS", "SENA MADUREIRA", "SENADOR GUIOMARD", "TARAUACA", "XAPURI"]
// }

// scraping('http://www.caixa.gov.br/atendimento/Paginas/encontre-a-caixa.aspx', dataState)

// Erro - Re fazer o cadastro das lotéricas de MG - RS