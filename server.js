// MARK: Instellingen
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

// MARK: Webinars
app.get('/webinars', async function (request, response) {
    const webinarUrl = "https://fdnd-agency.directus.app/items/avl_webinars";
    const webinarUrlFilters = "?fields=title,thumbnail,date,slug,speakers.*.*,categories.avl_categories_id.*,categories.avl_categories_name.*";
    const webinarsResponse = await fetch(webinarUrl + webinarUrlFilters);
    const webinarsResponseJSON = await webinarsResponse.json();
  
    const categoryFilter = request.query.category || "";
    const categoriesUrl = "https://fdnd-agency.directus.app/items/avl_categories"; 
    const categoriesResponse = await fetch(categoriesUrl);
    const categoriesResponseJSON = await categoriesResponse.json();

    let fliteredWebinars = webinarsResponseJSON.data;

    // filter aanmaken
    if (categoryFilter) {
        fliteredWebinars = fliteredWebinars.filter(webinar =>
            webinar.categories.some(category => category.avl_categories_id.name === categoryFilter)
        );
    }

    console.log(categoriesResponseJSON)

    response.render('webinars.liquid',{
        webinars: fliteredWebinars,
        categories: categoriesResponseJSON.data,
        selectedCategory: categoryFilter,
    })
})

// MARK: Detail page
app.get("/webinars/:slug", async function (request, response) {
    const slug = request.params.slug;
  
    // haal webinar ID op
    const webinarID = await fetch("https://fdnd-agency.directus.app/items/avl_webinars?fields=id&filter[slug][_eq]=" + slug)
    const webinarIDJSON = await webinarID.json();
    const webID = webinarIDJSON.data[0].id;
  
    // haal alle data van het webinar op
    const webinardetailResponse = await fetch(`https://fdnd-agency.directus.app/items/avl_webinars?filter[slug][_eq]=${slug}&fields=title,id,views,date,video,duration,resources.*.*,slug,thumbnail,transcript,description,categories.*.*,speakers.*.*`);
    const webinardetailResponseJSON = await webinardetailResponse.json();
  
    // haal alle data van de comments op
    const webinarComments = await fetch("https://fdnd-agency.directus.app/items/avl_comments?filter[webinar_id][_eq]=" + webID +"&sort`=-id")
    const webinarCommentsJSON = await webinarComments.json();
  
    response.render("detail.liquid", {
      webdetail: webinardetailResponseJSON.data[0],
      comments: webinarCommentsJSON.data,
    });
  });

// MARK: Post detail page
app.post("/webinars/:slug/:id", async function (request, response) {
  // In request.body zitten alle formuliervelden die een `name` attribuut hebben in je HTML
  console.log(request.body.comment)

  // Via een fetch() naar Directus vullen we nieuwe gegevens in
  await fetch(`https://fdnd-agency.directus.app/items/avl_comments`, {
    method: "POST",
    body: JSON.stringify({
      webinar_id: request.params.id,
      content: request.body.comment
    }),
    headers: {'Content-Type': 'application/json;charset=UTF-8'}
    });  


  // Redirect de gebruiker daarna naar een logische volgende stap
  // Zie https://expressjs.com/en/5x/api.html#res.redirect over response.redirect()
  response.redirect(303, `/webinars/${request.params.slug}`)
})

// MARK: 404
app.get('/404', async function (request, response) {
    response.render('partials/404.liquid')
  })

  // Local host instellen
app.set('port', process.env.PORT || 8000)
app.listen(app.get('port'), function () {
  console.log(` http://localhost:${app.get('port')}/ `)
})
