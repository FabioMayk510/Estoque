const express = require('express')
const app = express();
const port = 3000;

//Configurando o path para trabalhar com diretorio
const path = require('path');
const axios = require("axios");
const { captureRejectionSymbol } = require('events');

// Configurar o mecanismo de visualização e a pasta de visualização
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));

app.use(express.urlencoded());
app.use(express.json());

const urlIndex = "http://localhost:7000/index";

module.exports = function() {
    return app;
}

function obj(){
    axios.get(urlIndex).then(function (response) {
        const objetos = response.data;
        const ultimoId = objetos.length > 0 ? objetos[objetos.length - 1].id : 0;
        const novoId = ultimoId + 1;
        return novoId;
    })
}

function verificaEAdicionaOuAtualizaModeloPeça(modelo, peca, quantidade) {
    axios.get(urlIndex)
        .then(function (response) {
            const objetos = response.data;
            const modeloExistente = objetos.find(obj => obj.modelo === modelo);
            
            if (modeloExistente) {
                // O modelo já existe no banco de dados
                if (modeloExistente[peca]) {
                    // A peça também existe, então atualize a quantidade
                    modeloExistente[peca] = parseFloat(modeloExistente[peca]) + parseFloat(quantidade);
                } else {
                    // A peça não existe, então adicione-a com a nova quantidade
                    modeloExistente[peca] = parseFloat(quantidade);
                }
                // Atualize o objeto existente no banco de dados
                axios.put(`${urlIndex}/${modeloExistente.id}`, modeloExistente)
                    .then(function (response) {
                        console.log('Objeto atualizado:', response.data);
                    })
                    .catch(function (error) {
                        console.error('Erro na atualização:', error);
                    });
        } else {
            const id = obj();
            const data = {
                id: id,
                modelo: modelo,
                [peca]: parseFloat(quantidade)
            }
            axios.post(urlIndex, data).then(response => {
                console.log(response.data);
            }).catch(error => {
                console.error("erro: ", error)
            })
        }
    })
}

app.get('/', (req, res) => {
    res.render("inicio.ejs")
})

app.get('/adcionar', (req, res) => {
    axios.get("http://localhost:7000/Pecas").then(peca => {
        axios.get(urlIndex).then(resp => {
            var dados = resp.data;
            var pecas = peca.data;
            res.render("add.ejs", {dados: dados, pecas: pecas})
        })
    })
})

app.post('/add', (req, res) => {
    verificaEAdicionaOuAtualizaModeloPeça(req.body.modelo, req.body.Peca, req.body.qnt);
    console.log("final")
})

app.get('/remover', (req, res) => {
    res.send("A Introduzir metodo")
})

app.get('/estoque', (req, res) => {
    axios.get("http://localhost:7000/Pecas").then(peca => {
        axios.get(urlIndex).then(resp => {
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
