import { launch, Page } from 'puppeteer'
import { PendingXHR } from 'pending-xhr-puppeteer'
import {config} from 'dotenv'
import mongoose from 'mongoose'
import * as States from './states.controller'

config()

mongoose.connect(process.env.DATABASE_URL)

type OptionsScraping = {
    selectorType:string
    selectorUf:string,
    selectorCity:string
    UF:string,
}

async function valuesDropbox(page:Page, selector: string, pendingXHR:any){
    let result: string[]
    let attempts: number = 0

    do{
        await pendingXHR.waitForAllXhrFinished()
        result = await page.$$eval(
            selector + ' option', 
            all => all.map((element:any) => element.value)
        )
        attempts++
        console.log(attempts, result.length)
    }while(result.length <= 1 && attempts < 15)
    return result.filter(function (el) {
        return el != '';
      });
}

async function getCityDropbox(options:OptionsScraping, page:Page, pendingXHR:any){
    const { selectorType, selectorUf, selectorCity, UF } = options
    
    await page.goto(url)
    await page.waitForFunction(() =>  true)
    
    await page.select(selectorType,'2')
    await page.waitForFunction(() =>  true)
    await pendingXHR.waitForAllXhrFinished()
    
    await page.select(selectorUf, UF)
    await page.waitForFunction(() =>  true)
    await pendingXHR.waitForAllXhrFinished()
    
    console.log(UF)
    const citys = await valuesDropbox(page, selectorCity, pendingXHR)

    return citys
}


async function webScraping(url:string, path?:string){
    const selectorType = '#ctl00_ctl58_g_7fcd6a4b_5583_4b25_b2c4_004b6fef4036_ddlTipo'
    const selectorUf = '#ctl00_ctl58_g_7fcd6a4b_5583_4b25_b2c4_004b6fef4036_ddlUf'
    const selectorCity = '#ctl00_ctl58_g_7fcd6a4b_5583_4b25_b2c4_004b6fef4036_ddlCidade'


    const browser = await launch({
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ]
    })
    const page = await browser.newPage()
    const pendingXHR = new PendingXHR(page)
    
    await page.goto(url)
    await page.select(selectorType,'2')
    await pendingXHR.waitForAllXhrFinished()

    const states = await valuesDropbox(page, selectorUf, pendingXHR)

    let result = []
    
    for(const UF of states){
        const citys = await getCityDropbox({
            selectorType,
            selectorUf,
            selectorCity,
            UF
        }, page, pendingXHR)

        await States.create({
            state:UF,
            citys
        })

        result.push({
            uf:UF,
            citys
        })          
    }
    await browser.close()

    return
}

const url = 'http://www.caixa.gov.br/atendimento/Paginas/encontre-a-caixa.aspx'
const path = 'example.png'

webScraping(url, path)