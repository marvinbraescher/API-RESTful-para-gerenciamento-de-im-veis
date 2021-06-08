const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')
const formidableMiddleware = require('express-formidable')
const bcrypt = require('bcrypt')
const login = require('./middleware/login')
const Sequelize = require('sequelize')
const sequelize = new Sequelize('usuario', 'root', 'senhaQualquer', {
    host: "localhost",
    dialect: 'mysql'
})
const usuario = sequelize.define('usuarios', {
    nome:{
        type: Sequelize.STRING,
        allowNull: false
    },
    cpf:{
        type: Sequelize.STRING,
        allowNull: false
    },
    email:{
        allowNull: false,
        unique: true,
        type: Sequelize.STRING
    },
    senha:{
        allowNull: false,
        type: Sequelize.STRING
    }   
})
const imovel = sequelize.define('imoveis', {
    cep:{
        type: Sequelize.STRING,
    },
    numero:{
        type: Sequelize.INTEGER,   
    },
    complemento:{
        type: Sequelize.STRING
    },
    aluguel:{
        type: Sequelize.STRING
    },
    quartos:{
        type: Sequelize.STRING
    },
    disponibilidade:{
        type: Sequelize.BOOLEAN
    }     
})//separar do codigo

//usuario.sync({force:true})
//imovel.sync({force:true})

app.use(formidableMiddleware())

//cria um usuario com uma hash
app.post('/cadastro', function(req, res) {
   
    bcrypt.hash(req.fields.psw, 10, function(err, hash) {
        usuario.create({
            nome: req.fields.name,
            cpf: req.fields.cpf,
            email: req.fields.email,
            senha: hash
        })
    })
})
//aplica o login com autentificação JWT e gera um token de acesso
//utiliza bcrypt para identificar se a hash confere com a de cadastro 
app.post('/auth', login, function(req, res){
    usuario.findOne({
        where:{
            email: req.fields.mail,
        },
        atributes:['senha', 'id','email']

    }).then(function(auth){
        bcrypt.compare(req.fields.psw, auth.senha, function(err, result) {
            if(result){
                const token = jwt.sign({
                    id_usuario: auth.id,
                    email: auth.email,
                }, process.env.JWT_KEY,
                {
                    expiresIn: "1h"
                }
                )

                console.log(token)

            }else{
               return res.status(404).send({mensagem: "Falha na autentificação"})
            }
        })
    })
})
//Busca a lista de imoveis cadastrados
app.get('/imoveis', function(req, res){
    
       imovel.findAll()
        .then(function(imovel){
                res.send(imovel)
        }) 
        
})

//cadastra novos imoveis
app.post('/imoveis', function(req, res){
        imovel.create({
            cep: req.fields.cep,
            numero: req.fields.numero,
            complemento: req.fields.comp,
            aluguel: req.fields.aluguel,
            quartos: req.fields.quartos,
            disponibilidade: req.fields.disp
        }).then(function(imovel){
            res.send(imovel)
        })
    
})

//busca por imoveis pelo ID
app.get('/imoveis/:id', function(req, res){
    imovel.findAll({
        where:{
            id: req.params.id
        }
    })
    .then(function(imovel){
        if(imovel.length > 0){
             return res.status(200).send({mensagem:"encontrado"})
        }else{
            return res.status(404).send({mensagem:"falha na busca"})
        }
    })
    
})

//deleta imoveis pelo ID
app.delete('/imoveis/:id', function(req, res){
        imovel.destroy({
            where:{
                id: req.params.id
            }
        }).then(function(imovel){
            if(imovel == 1){
                return res.status(204).send({mensagem:"Deletado"})
            }else{
                return res.status(404).send({mensagem:"Falha na busca"})
            }
        })
})

//atualiza valores de um imovel
app.post('/imoveis/update/:id', function(req, res){

})

app.listen(3000, function() {

    console.log('Servidor rodando localhost:3000')

})
