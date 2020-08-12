import { launch, Page} from 'puppeteer'
import { PendingXHR } from 'pending-xhr-puppeteer'
// import mongoose from 'mongoose'
import 'dotenv/config'
// import { toUnicode } from 'punycode'

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
    const [
        name, 
        street, 
        neighborhood, 
        zip, 
        city, 
        uf, 
        phone, 
        agencyNumber 
    ] = data.replace('Tel: ','')
        .replace(/ - /g, '\n')
        .replace(', ', '\n')
        .replace('Ag. Número: ', '')
        .split('\n')
        .filter(element => element !== '')

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
}

async function scraping(url:string, uf:string, city:string){
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

    await page.select(selectState,uf)
    await page.waitForFunction(() => true)
    await pendingXHR.waitForAllXhrFinished()
    await sleep(getRandomArbitrary(100,300))


    await page.select(selectCity, city)
    await page.waitForFunction(() => true)
    await pendingXHR.waitForAllXhrFinished()
    await sleep(getRandomArbitrary(100,300))

    await page.click(buttonSearch)
    await page.waitForFunction(() => true)
    await pendingXHR.waitForAllXhrFinished()
    await sleep(getRandomArbitrary(400,600))

    await page.screenshot({path: `./images/${uf}_${city}.png`, fullPage: true})

    const arrayLottery = await page.evaluate( () => {
        const lottery:any = document.querySelectorAll('div.resultado-busca-item')
        const arrayLottery = [ ...lottery ].map(element => element.innerText)
        return arrayLottery
    } )
    
    const lottery = arrayLottery.map(element => formatData(element))

    console.log(lottery)
    await browser.close()
}

export default {
    key:'queue',
    async handle(data){
        console.log('Iniciando.....')
        const {uf, city} = data.data
        console.log(uf, city)
        try {
            await scraping(url, uf, city)
            console.log('Fim.....')
        } catch (error) {
            console.log(error)
        }
    }
}

scraping('http://www.caixa.gov.br/atendimento/Paginas/encontre-a-caixa.aspx', 'SP', 'BARUERI')