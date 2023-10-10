const express = require('express')
const app = express();
const port = 3000;

//Configurando o path para trabalhar com diretorio
const path = require('path');
const axios = require("axios");

// Configurar o mecanismo de visualização e a pasta de visualização
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));

app.use(express.urlencoded());
app.use(express.json());

module.exports = function() {
    return app;
}

app.get('/', (req, res) => {
    res.render("inicio.ejs")
})

app.get('/adcionar', (req, res) => {
    axios.get("http://localhost:7000/Pecas").then(peca => {
        var pecas = peca.data;
        res.render("add.ejs", {pecas: pecas})
    })
})

app.post('/add', (req, res) => {
    
})

app.get('/remover', (req, res) => {
    res.send("A Introduzir metodo")
})

app.get('/estoque', (req, res) => {
    axios.get("http://localhost:7000/Pecas").then(peca => {
        axios.get("http://localhost:7000/index").then(resp => {
            var dados = resp.data;
            var pecas = peca.data;
            console.log(dados)
            res.render("index.ejs", {dados: dados, pecas: pecas})
        })
    })
    
        
    //res.render("index.ejs", {dados: dados})
    
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor iniciado em http://10.10.24.159:${port}`);
});
