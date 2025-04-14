import express from 'express'
import { Liquid } from 'liquidjs';

const app = express()
app.use(express.urlencoded({extended: true}))
app.use(express.static('public'))

const engine = new Liquid()
app.engine('liquid', engine.express())
app.set('views', './views')


// MARK: Home
app.get('/', async function (request, response) {
    // connectie maken met server
    // ... 
    // data doorgeven aan de template

    response.render('index.liquid',{

    })
})

app.set('port', process.env.PORT || 8000)
app.listen(app.get('port'), function () {
  console.log(`Daarna kun je via http://localhost:${app.get('port')}/ jouw interactieve website bekijken.\n\nThe Web is for Everyone. Maak mooie dingen 🙂`)
})
