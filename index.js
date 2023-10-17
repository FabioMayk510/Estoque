const express = require('express')
const app = express();
const port = 3000;

//Configurando o path para trabalhar com diretorio
const path = require('path');
const axios = require("axios");
const { captureRejectionSymbol } = require('events');
const { isUndefined } = require('util');

// Configurar o mecanismo de visualização e a pasta de visualização
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));

app.use(express.urlencoded());
app.use(express.json());

const urlIndex = "http://localhost:7000/index";
const urlPecas = "http://localhost:7000/Pecas";
const urlBase = "http://localhost:5000/";

module.exports = function() {
    return app;
}

function codigo(pecas, modeloEnv, nomePeca){
    var lista = Object.keys(pecas.pecas) 
    
    for (const peca in pecas.pecas) {
        const descDaPeca = pecas.pecas[peca].desc;
        if (descDaPeca === nomePeca) {
            console.log("peca: ", peca)
            console.log("peca: ", modeloEnv)
            if (pecas.pecas[peca].modelo.includes(modeloEnv)){
                console.log("--------------------------")
                return peca
            }
        }
    }
}

function format(obj, filtro, i){
    return obj.data[0][Object.keys(filtro.data[0])[i]]
}

function model(pecas){
    const dadosFiltrados = {};

    // Itera sobre as peças e filtra apenas as que correspondem ao modelo desejado
    for (const peca in pecas.data[0]) {
        const modelosDaPeca = pecas.data[0][peca].modelo;
        if (modelosDaPeca.includes("M4080")) {
            dadosFiltrados[peca] = pecas.data[0][peca];
        }
    }

    return dadosFiltrados
}

function obj(){
    axios.get(urlIndex).then(function (response) {
        const objetos = response.data;
        const ultimoId = objetos.length > 0 ? objetos[objetos.length - 1].id : 0;
        const novoId = ultimoId + 1;
        return novoId;
    })
}

function verificaEAdicionaOuAtualizaModeloPeça(modelo, peca, quantidade, codigo) {
    axios.get(`${urlBase}Pecas`)
        .then(function (response) {
            axios.get(`${urlBase}index`).then(function (resp){
                const index = resp.data[0];
                const pecas = response.data[0];
                console.log("index:: ", index, "pecas:: ", pecas, "codigo:: ", codigo)

                if (index.pecas[codigo]) {
                    // A peça já existe no banco de dados index
                    if (pecas.pecas[codigo]) {
                        // A peça também existe no banco de dados Pecas
                        index.pecas[codigo] = parseFloat(index.pecas[codigo]) + parseFloat(quantidade);
                    } else {
                        // A peça não existe, então adicione-a com a nova quantidade
                        pecas.pecas[codigo] = {
                            modelo: [
                                modelo
                            ],
                            desc: peca
                        }
                    }

                    // Atualize o objeto existente no banco de dados
                    axios.put(`${urlBase}index/1`, index)
                        .then(function (response) {
                            console.log('Objeto atualizado:', response.data);
                        })
                        .catch(function (error) {
                            console.error('Erro na atualização:', error);
                        });
                    axios.put(`${urlBase}Pecas/1`, pecas)
                        .then(function (response) {
                            console.log('Objeto atualizado:', response.data);
                        })
                        .catch(function (error) {
                            console.error('Erro na atualização:', error);
                        });
                } else {
                    // O modelo não existe, crie um novo objeto
                    index.pecas[codigo] = quantidade
                    pecas.pecas[codigo] = {
                        modelo: [
                            modelo
                        ],
                        desc: peca
                    }

                    // Atualize o objeto no banco de dados
                    axios.put(`${urlBase}index/1`, index)
                        .then(function (response) {
                            console.log('Objeto atualizado:', response.data);
                        })
                        .catch(function (error) {
                            console.error('Erro na atualização:', error);
                        });
                    axios.put(`${urlBase}Pecas/1`, pecas)
                        .then(function (response) {
                            console.log('Objeto atualizado:', response.data);
                        })
                        .catch(function (error) {
                            console.error('Erro na atualização:', error);
                        });
                }
            })
        });
}


app.get('/', (req, res) => {
    res.render("inicio.ejs")
})

app.get('/adicionar', (req, res) => {
    axios.get(`${urlBase}Pecas`).then(peca => {
        axios.get(`${urlBase}index`).then(codigos => {
            var dados = codigos.data;
            var pecas = peca.data;
            var modelo;
            console.log(dados, pecas, modelo)
            res.render("add.ejs", {dados: dados, pecas: pecas, modelo: modelo})
        })
    })
})

// app.post('/adicionar', (req, res) => {
//     const modelo = req.body.modelo;
//     axios.get(`${urlIndex}/?modelo=${modelo}`).then(resp => {
//         var dados = resp.data;
//         console.log(dados)
//         if(!isUndefined(dados[0])){
//             console.log("aqui")
//             var pecas = dados;
//             res.render("add.ejs", {dados: dados, pecas: pecas, modelo: modelo})
//         } else {
//             const id = obj();
//             const data = [{
//                 id: id,
//                 modelo: modelo,
//                 pecas: [
//                     {
//                     }
//                 ]
//             }]
//             dados = data;
//             console.log("Novo dados: ", dados)
//             var pecas = dados;
//             res.render("add.ejs", {dados: dados, pecas: pecas, modelo: modelo})
//         }
        
//     })
// })

app.post('/add', (req, res) => {
    console.log("vai", req.body.modelo)
    if(req.body.codigo === ""){
        console.log("entrou")
        axios.get(`${urlBase}Pecas`).then(resp => {
            console.log("aqui tbm")
            verificaEAdicionaOuAtualizaModeloPeça(req.body.modelo, req.body.Peca, req.body.qnt, codigo(resp.data[0], req.body.modelo, req.body.Peca));
            
        })
    } else {
        verificaEAdicionaOuAtualizaModeloPeça(req.body.modelo, req.body.Peca, req.body.qnt, req.body.codigo);
    }
})

app.get('/remover', (req, res) => {
    res.send("A Introduzir metodo")
})

app.get('/teste', (req, res) => {
    axios.get("http://localhost:5000/index").then(codigos => {
        axios.get("http://localhost:5000/Pecas").then(pecas => {
            console.log("codigos: ", Object.keys(pecas.data[0]))
            console.log("peça: ", format(pecas, codigos, 1).desc)
            console.log("Por modelos: ", model(pecas))
            for(let i = 0; i < Object.keys(pecas.data[0]).length; i++){ 
                console.log("Nome das peças: ", format(pecas, codigos, i).desc)
            }
        })
    })
})

app.get('/estoque', (req, res) => {
    axios.get(`${urlBase}Pecas`).then(peca => {
        axios.get(`${urlBase}index`).then(codigos => {
            var dados = codigos.data;
            var pecas = peca.data;
            res.render("index.ejs", {dados: dados, pecas: pecas})
        })
    })
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor iniciado em http://10.10.24.159:${port}`);
});
