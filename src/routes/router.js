const express = require('express');
const router = express.Router();

const { validationResult } = require('express-validator');
const SearchValidator = require('../validators/search.validator');
const BrowserService = require('../services/BrowserService')

router.get('/', ({ res }) => {
    res.send('Hello Asksuite World!');
});

router.post('/search', SearchValidator, async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) return res.status(400).send({ errors: result.array() });
    try {
        const { checkin, checkout } = req.body
        const browser = await BrowserService.getBrowser();

        const page = await browser.newPage();
        await page.goto(`https://reservations.fasthotel.me/188/214?entrada=${checkin}&saida=${checkout}&adultos=1#acomodacoes`);
        const parentSelector = 'div.row.borda-cor';
        await page.waitForSelector(parentSelector);
        const elements = await page.$$(parentSelector);

        const bookings = []
        for (const element of elements) {
            const className = await page.evaluate(el => el.className, element)

            if (className == "row borda-cor") {
                const name = await element.$eval('h3', el => el.textContent.trim()).catch(() => 'No name found');
                const description = await element.$eval('div.quarto.descricao', el => el.textContent.trim()).catch(() => 'No description found');
                await page.waitForSelector('div.row.tarifa div.col-md-12 table tbody tr td div b[data-campo="valor"]');
                const price = await element.$eval(
                    'div.row.tarifa div.col-md-12 table tbody tr td div b[data-campo="valor"]',
                    el => el.textContent.trim()
                ).catch(() => 'No price found');
                const image = await element.$eval('img', el => el.src).catch(() => 'No image found');

                bookings.push({
                    name,
                    description,
                    price,
                    image
                })
            }
        }
        await BrowserService.closeBrowser(browser);
        res.send(bookings)
    } catch (error) {
        res.status(500).send(error);
    }
});


module.exports = router;
