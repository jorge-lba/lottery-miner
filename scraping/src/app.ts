import { launch, connect } from 'puppeteer'

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
  }

async function valuesDropbox(page:any, selector: string){
    let result: string[]
    let attempts: number = 0

    do{
        sleep(300)
        result = await page.$$eval(
            selector + ' option', 
            all => all.map((element:any) => element.value)
        )
        attempts++

        console.log(attempts, result.length)
    }while(result.length <= 1 && attempts < 10)

    return result
}


async function webScraping(url:string, path?:string){
    const selectType = '#ctl00_ctl58_g_7fcd6a4b_5583_4b25_b2c4_004b6fef4036_ddlTipo'
    const uf = '#ctl00_ctl58_g_7fcd6a4b_5583_4b25_b2c4_004b6fef4036_ddlUf'
    const city = '#ctl00_ctl58_g_7fcd6a4b_5583_4b25_b2c4_004b6fef4036_ddlCidade'


    const browser = await launch({
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ]
    })
    const page = await browser.newPage()
    await page.goto(url)
    await page.select(selectType,'2')
    
    const states = await valuesDropbox(page, uf)

    let result = []

    for(const UF of states){
        console.log(UF)
        await page.goto(url)
        await page.select(selectType,'2')
        sleep(500)
        await page.select(uf, UF)
        sleep(1200)
        const citys = await valuesDropbox(page, city)
        result.push({
            uf:UF,
            citys
        })        
    }
    console.log(result)
    await browser.close()
    return
}

const url = 'http://www.caixa.gov.br/atendimento/Paginas/encontre-a-caixa.aspx'
const path = 'example.png'

webScraping(url, path)