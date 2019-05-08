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
const config = require('./config/conf.json');
//console.log(config.Nodos);
//---------------------------------------
//--------------Globales-----------------
var tabla = [];
var tengoPIM = false;
var dirPIM = "localhost";
var puerto = 3001;
var rebote = "2";
//---------------------------------------

var request = require('request');
//const fs = require('fs')
//var jsonData = JSON.parse(fs.readFileSync('esbconf.json', 'utf-8'))

app.listen(puerto, function () {
  console.log('TIenda fake: webserver en el puerto '+puerto+' !');
});

app.get('/', function (req, res) {
  res.send('Inicio');
});

app.get('/tienda/obtenerCatalogo', function (req, res) 
{
  //res.send('catalogo JSON');
  /*var origen = req.body.origen;
  var destino = req.body.destino;
  var jwt = req.body.destino;
  console.log(destino);*/

  if(tengoPIM)
  {
    //ES ESTE MISMO PIM
    res.send('MI PIM');
  }
  else
  {
      //ES OTRO PIM
      var nodoPIM = getPIM();
      console.log("Redirigiendo a:" + nodoPIM.nodo + ":" + puerto + "/PIM/obtenerCatalogo"+rebote);
      const options = {
        url: "http://"+nodoPIM.nodo + ":" + puerto + "/PIM/obtenerCatalogo"+rebote,
        method:'GET',
        /*headers: {
            'Accept': 'application/json',
            'Accept-Charset': 'utf-8',
        }*/
      };

      request(options,  (err, response, body) => 
      {
        if (err) { return console.log(err); }
        
        res.send(body);
      });
  }
});

app.get('/tienda/colocarOrden', function (req, res) 
{
  //res.send('catalogo JSON');
  /*var origen = req.body.origen;
  var destino = req.body.destino;
  var jwt = req.body.destino;
  console.log(destino);*/

  if(tengoPIM)
  {
    //ES ESTE MISMO PIM
    res.send('MI PIM');
  }
  else
  {
      //ES OTRO PIM
      var nodoPIM = getPIM();
      console.log("Redirigiendo a:" + nodoPIM.nodo + ":" + puerto + "/PIM/obtenerCatalogo"+rebote);
      const options = {
        url: "http://"+nodoPIM.nodo + ":" + puerto + "/PIM/obtenerCatalogo"+rebote,
        method:'GET',
        /*headers: {
            'Accept': 'application/json',
            'Accept-Charset': 'utf-8',
        }*/
      };

      request(options,  (err, response, body) => 
      {
        if (err) { return console.log(err); }
        
        res.send(body);
      });
  }
});

app.get('/PIM/enriquecerProducto', function (req, res) {

  console.log(req.body.length);
  
  if(tengoPIM)
  {
    //ES ESTE MISMO PIM
    res.send('MI PIM');
  }
  else
  {
      //ES OTRO PIM
      var nodoPIM = getPIM();
      console.log("Redirigiendo a:" + nodoPIM.nodo + ":" + puerto + "/PIM/enriquecerProducto"+rebote);
      const options = {
        url: "http://"+nodoPIM.nodo + ":" + puerto + "/PIM/enriquecerProducto"+rebote,
        method:'GET',
        json: true,
        body: req.body
      };

      request(options,  (err, response, body) => 
      {
        if (err) { return console.log(err); }
        
        res.send(body);
      });
  }
});

app.get('/Bodega/obtenerInventario2', function (req, res) {

  var arregloSKU = req.body.arreglo;
  //var arregloSKU = req.body;
  var arregloRespuesta = [];
  for(var i = 0; i < arregloSKU.length; i++)
  {
    //enriquecerProducto
    /*var objeto = {
      sku:arregloSKU[i],
      nombre:"nombre",
      precio_lista:100.0,
      descripcion_corta:"descripcion corta",
      descripcion_larga:"descripcion larga",
      imagenes: ["img1","img2"],
      categorias: [1, 2, 3],
      activo: true
    };*/
    //obtenerInventario
    var objeto = {
      sku:arregloSKU[i],
      inventario:Math.floor(Math.random() * (+10 - +1)) + +1,
    };
    arregloRespuesta.push(objeto);
  }
  //var body = {respuesta: arregloRespuesta};
  //res.send(JSON.stringify(body));
  res.send(JSON.stringify(arregloRespuesta));
});

app.get('/Bodega/obtenerInventario', function (req, res) {
  console.log(req.body.length);
  /*
  if(tengoPIM)
  {
    //ES ESTE MISMO PIM
    res.send('MI PIM');
  }
  else
  {*/
    console.log(req.body.destino);
      var nodo = tabla[req.body.destino];
      console.log("Redirigiendo a:" + nodo.nodo + ":" + puerto + "/Bodega/obtenerInventario"+rebote);
      const options = {
        url: "http://"+nodo.nodo + ":" + puerto + "/Bodega/obtenerInventario"+rebote,
        method:'GET',
        json: true,
        body: req.body
      };

      request(options,  (err, response, body) => 
      {
        if (err) { return console.log(err); }
        res.send(body);
      });
  //}

});

app.get('/Bodega/realizarDespacho', function (req, res) {
  console.log("Realizar Despacho");
  console.log(req.body.length);
  
  console.log(req.body.destino);
  var nodo = tabla[req.body.destino];
  console.log("Redirigiendo a:" + nodo.nodo + ":" + puerto + "/Bodega/realizarDespacho"+rebote);
  const options = {
    url: "http://"+nodo.nodo + ":" + puerto + "/Bodega/realizarDespacho"+rebote,
    method:'GET',
    json: true,
    body: req.body
  };

  request(options,  (err, response, body) => 
  {
    if (err) { return console.log(err); }
    res.send(body);
  });
      
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
  var body = {};
  var arreglo =[];
  arreglo.push("sku1");
  arreglo.push("sku2");
  arreglo.push("sku3");
  body.arreglo = arreglo;
  body.destino = "nodoamerica.grupo4.com";

  var options = {
    url: 'http://localhost:3000/Bodega/obtenerInventario',
    method: 'GET',
    /* */
    json:true,
    body:body
    /* */
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log("Fin: ", body) // Print the shortened url.
    }
    else
    {
      console.log("ups!", error);
    }
  });
}


function cargarConfiguracion()
{
  console.log("Cargando nodos...");
  config.Nodos.forEach(function(nodo)
  {
    //console.log(">> ", nodo);
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
    var nodoTabla = tabla[nodo];
    console.log(nodoTabla.tipo);
    if(nodoTabla.tipo === "pim" || nodoTabla.tipo === "PIM" || nodoTabla.tipo === "Pim")
    {
        return nodoTabla;
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

//------------CLIENTE-----------------
//Consultar catalogo (categorias)
// Seleccionar un producto random
//http://localhost:1234/tienda/colocarOrden (producto aleatorio de la 1era consulta, cantidad aleatoria según conf)


//------------------------------------

console.log("Cliente de la tienda");
//cargarConfiguracion();
//test();