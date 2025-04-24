// npm package Express importeren (npm install)
import express from 'express'
import { Liquid } from 'liquidjs';


// nieuwe express applicatie aanmaken
const app = express()

// maakt werken met data uit formulieren prettiger 
app.use(express.urlencoded({extended: true}))

// public als map voor statische bestanden instellen
app.use(express.static('public'))


// liquid als 'view engine' instellen
const engine = new Liquid()
app.engine('liquid', engine.express())

// views als map voor liquid bestanden instellen
app.set('views', './views')


// MARK: Home
app.get('/', async function (request, response) {
    // connectie maken met server
    const webinarUrl = "https://fdnd-agency.directus.app/items/avl_webinars";
    const webinarUrlFilters = "?fields=title,thumbnail,date,slug,categories.*.*,speakers.*.*";
    const contouringsUrl = "https://fdnd-agency.directus.app/items/avl_contourings";
    const contouringsUrlFilters = "?fields=title,slug,image_scan,used_literature.*.*,categories.*.*";

    // doe een fetch naar de data die je nodig hebt
    const webinarsResponse = await fetch(webinarUrl + webinarUrlFilters);
    const webinarsResponseJSON = await webinarsResponse.json();

    const contouringsResponse = await fetch(contouringsUrl + contouringsUrlFilters);
    const contouringsResponseJSON = await contouringsResponse.json();

    // data doorgeven aan de template
    response.render('index.liquid',{
        webinars: webinarsResponseJSON.data,
        contourings: contouringsResponseJSON.data
    })
})

app.get('/webinars', async function (request, response) {
    const webinarUrl = "https://fdnd-agency.directus.app/items/avl_webinars";
    const webinarUrlFilters = "?fields=title,thumbnail,date,slug,categories.*.*,speakers.*.*";
    const webinarsResponse = await fetch(webinarUrl + webinarUrlFilters);
    const webinarsResponseJSON = await webinarsResponse.json();
  
    response.render('webinars.liquid',{
        webinars: webinarsResponseJSON.data 
    })
})

app.set('port', process.env.PORT || 8000)
app.listen(app.get('port'), function () {
  console.log(` http://localhost:${app.get('port')}/ `)
})
