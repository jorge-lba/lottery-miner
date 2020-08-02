import { launch } from 'puppeteer'

async function webScraping(url:string, path?:string){
    const browser = await launch({
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ]
    })
    const page = await browser.newPage()
    await page.goto(url)
    await page.screenshot({path})

    await browser.close()
}

const url = 'http://www.caixa.gov.br/atendimento/Paginas/encontre-a-caixa.aspx'
const path = 'example.png'

webScraping(url, path)