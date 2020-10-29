// load 4 libraries
const express = require('express')
const handlebars = require ('express-handlebars')
const fetch = require('node-fetch')
const withQuery = require('with-query').default

//configure port
const PORT = parseInt(process.argv[2]) || parseInt(process.env.APP_PORT) || 3000 
const API_KEY = process.env.API_KEY || "eBsSQnHzkUpWJnpQYrrKWAbudH5gvuFM";
const GIPHY_URL = 'https://api.giphy.com/v1/gifs/search'


//create an instance of express
const app = express()

//configue hbs
app.engine('hbs', handlebars({defaultLayout: 'default.hbs'}))
app.set('view engine', 'hbs')

//configure app
app.get('/', (req, res) => {
res.status(200)
res.type('text/html')
res.render('index')
})

/*
https://api.giphy.com/v1/gifs/search
    ?api_key=API_KEY
    &q=noodles
    &limit=10
    &rating=g
    &lang=en
*/


app.get('/search', 
    async (req, res) => {
        const search = req.query['search-term']
        //construct url with the query parameter
        console.info('search-term: ', search)
        //search giphy using await
        const url = withQuery (
            GIPHY_URL, 
            {
                api_key: API_KEY,
                q: search,
                limit: 10,
            })

        const result = await fetch(url)
        const giphys = await result.json()
        const data = giphys
        console.info('giphys: \n', giphys)
        
        // search giphy, use await
        /*
        const imgs = []
        for (let d of giphys.data) {
            const title = d.title
            const url = d.images.fixed_height.url 
            imgs.push(
                {title, url}  //mapping one object type to another
                )
        }
        */


        const imgs = giphys.data
        .filter(      //takes an array and returns a reduced array
            d => {
                return !d.title.includes('f**k')
            }
        )
        .map(           //.map takes an array and converts it into the same type
            (d) => {
                return {title: d.title, url: d.images.fixed_height.url}
            })
                        //.reduce takes an array and returns a value
        console.info(imgs)


        res.status(200)
        res.type('text/html')
        res.render('giphy', {
            search, imgs,
            //hasContent: imgs.length > 0
            hasContent: !!imgs.length
        })
})

if (API_KEY)
    app.listen(PORT, () => {
        console.info(`Application started on port ${PORT} at ${new Date()}`)
        console.info(`with key ${API_KEY}`)
})
else
    console.error('API_KEY is not set')



