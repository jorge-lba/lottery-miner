import { launch } from 'puppeteer'

async function valuesDropbox(page:any, selector: string){
    const result = await page.$$eval(
        selector + ' option', 
        all => all.map((element:any) => element.value)
    )

    return result
}

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
  }

async function webScraping(url:string, path?:string){
    const box = '#ctl00_ctl58_g_7fcd6a4b_5583_4b25_b2c4_004b6fef4036_ddlCidade'

    const browser = await launch({
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ]
    })
    const page = await browser.newPage()
    await page.goto(url)
    await page.select('#ctl00_ctl58_g_7fcd6a4b_5583_4b25_b2c4_004b6fef4036_ddlTipo','2')
    await sleep(1000)
    await page.select('#ctl00_ctl58_g_7fcd6a4b_5583_4b25_b2c4_004b6fef4036_ddlUf', 'SP')
    await sleep(1000)
    await page.screenshot({path})
    const elements = await valuesDropbox(page, box)
    console.log(elements)

    await browser.close()
}

const url = 'http://www.caixa.gov.br/atendimento/Paginas/encontre-a-caixa.aspx'
const path = 'example.png'

webScraping(url, path)