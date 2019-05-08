'use strict';
//--------------Servidor Web------------
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));
//---------------------------------------
//-----------Configuracion---------------
//const _ = require('lodash');
const config = require('./config/esbconf.json');
console.log(config.Nodos);
//---------------------------------------
//--------------Globales-----------------
var tabla = [];
var tengoPIM = false;
var dirPIM = "localhost";
//---------------------------------------

var request = require('request');
//const fs = require('fs')
//var jsonData = JSON.parse(fs.readFileSync('esbconf.json', 'utf-8'))

app.listen(3000, function () {
  console.log('Servidor web en el puerto 3000!');
});

app.get('/', function (req, res) {
  res.send('Inicio');
});

app.get('/PIM/obtenerCatalogo', function (req, res) 
{
  //res.send('catalogo JSON');
  /*var origen = req.body.origen;
  var destino = req.body.destino;
  var jwt = req.body.destino;
  console.log(destino);*/

  if(tengoPIM)
  {
    //ES ESTE MISMO PIM
    res.send('YO');
  }
  else
  {
      //ES OTRO PIM
      var nodoPIM = getPIM();
      console.log("Redirigiendo a:" + nodoPIM.nodo + ":3000/PIM/obtenerCatalogo2");
      const options = {
        url: nodoPIM.nodo+":3000/PIM/obtenerCatalogo2",
        method:'GET',
        /*headers: {
            'Accept': 'application/json',
            'Accept-Charset': 'utf-8',
        }*/
      };

      request(options,  (err, res, body) => 
      {
        if (err) { return console.log(err); }
        console.log("--------BODY--------");
        console.log(body);
        console.log("--------------------");
        res.send("YO NO");
      });
  }
});

app.get('/PIM/obtenerCatalogo2', function (req, res) {
  res.send('BILL!');
});

app.get('/PIM/enriquecerProducto', function (req, res) {
  res.send('catalogo JSON');
});

app.get('/Bodega/obtenerInventario', function (req, res) {
  console.log("obteniendo inventario");
  res.send('123');
});

app.get('/Bodega/realizarDespacho', function (req, res) {
  console.log("realizar despacho");
  res.send('456');
});




app.post('/test/test', function(req, res) {
  var user_id = req.body.id;
  var token = req.body.token;
  var geo = req.body.geo;

  res.send(user_id + ' ' + token + ' ' + geo);
});


function test()
{
  console.log("TEST:");
  var options = {
    uri: 'localhost:3000/PIM/obtenerCatalogo',
    method: 'GET'
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log("Fin: "+body) // Print the shortened url.
    }
    else
    {
      console.log("ups!", error);
    }
  });
  
}


function cargarNodos()
{
  console.log("Cargando nodos...");
  config.Nodos.forEach(function(nodo)
  {
    //console.log(">> "+nodo.nodo);
    var nodoArreglo = nodo.nodo.split('.');
    nodo.ubicacion = nodoArreglo[0];
    var servidorArreglo = nodo.servidor.split('.');
    nodo.tipo = servidorArreglo[0];
    nodo.grupo = servidorArreglo[1];
    if(nodo.tipo === "pim" && nodo.nodo === config.Actual)
    {
        dirPIM = nodo.nodo;
        tengoPIM = true;
        console.log("ESTE ES EL PIM");
    }
    tabla[nodo.nodo] = nodo;
  });
}

function getPIM()
{
  for(var nodo in tabla)
  {
    if(nodo.tipo === "pim" || nodo.tipo === "PIM" || nodo.tipo === "Pim")
    {
        return nodo;
    }
  }
}

function checkOrigen(destino)
{
  if(destino === config.Actual)
  {
    return true;
  }
  return false;
}

cargarNodos();
test();