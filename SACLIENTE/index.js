'use strict';

//--------------Servidor Web------------
var request = require('request');
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

var puerto = 8084;
var rebote = "2";
var tiendaport = 8084;
//var tiendadir = "localhost";

//---------------------------------------
//--------------Reportes-----------------
var fallidas = 0;
var total = 0;
var tiempos = [];
var periodo = 0;
//---------------------------------------

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


app.listen(puerto, function () {
  console.log('TIenda fake: webserver en el puerto '+puerto+' !');
});

app.get('/', function (req, res) {
  res.send('Inicio');
});

app.get('/tienda/obtenerCatalogo', function (req, res) 
{
  var body = {
    categorias:".",
    productos:
    [
      {
        nombre:"Producto1",
        sku:"sku1",
        categorias:[1,2,3 ],
        activo:true
      },
      {
        nombre:"Producto2",
        sku:"sku2",
        categorias:[4,5,6 ],
        activo:true
      },
      {
        nombre:"Producto3",
        sku:"sku3",
        categorias:[1,3,5 ],
        activo:false
      },
      {
        nombre:"Producto4",
        sku:"sku4",
        categorias:[4,2,6 ],
        activo:false
      }
    ]
  };

  res.send(body);
});

app.get('/tienda/colocarOrden', function (req, res) 
{
  //console.log("-> ", req.body);
  res.send({response: true});
});


app.get('/tienda/obtenerInventario', function (req, res) {

  var body = {
    products:
    [
      {
        sku:"sku1",
        inventario:3,
      },
      {
        sku:"sku2",
        inventario:1,
      },
      {
        sku:"sku3",
        inventario:50,
      },
      {
        sku:"sku4",
        inventario:100,
      }
    ]
  };
  res.send(body);
});

//------------CLIENTE-----------------
// Consultar catalogo (categorias)
// Seleccionar un producto random
// Consultar disponibilidad
//http://localhost:1234/tienda/colocarOrden (producto aleatorio de la 1era consulta, cantidad aleatoria según conf)


//------------------------------------

async function start()
{
  console.log("Running client:");
  //Consultar categorias
  var indiceTienda = 0;
  for(let i = 0; i < config.ordenes; i++)
  {
    setInterval(enviarOrden, config.tiempoMuerto);
    //enviarOrden();
  }
}

function enviarOrden()
{
  var tiendaIndex =  Math.floor(Math.random() * (+config.tiendas.length - +0)) + +0;
  console.log("Le toca a la tienda: "+tiendaIndex+" - "+config.tiendas[tiendaIndex]);
  var tiendadir = config.tiendas[tiendaIndex];
  var bodySend = {};
  var optionsObtenerCatalogo = {
    url: 'http://'+tiendadir+':'+tiendaport+'/tienda/obtenerCatalogo',
    method: 'GET',
    json:true,
    body:bodySend
  };

  request(optionsObtenerCatalogo, function (error, response, body) {
    if (!error && response.statusCode == 200) 
    {
      //console.log("Fin: ", body) // Print the shortened url.
      consultarInventario(body, tiendadir);
    }
    else
    {
      console.log("Ups1!", error);
    }
  });
}

function consultarInventario(body, tiendadir)
{
  var cantidadProducto = Math.floor(Math.random() * (+config.rangoFinalCantidadProductos - +config.rangoInicialCantidadProductos)) + +config.rangoInicialCantidadProductos;
  var indiceProducto = Math.floor(Math.random() * (+body.productos.length - +0)) + +0;
  console.log("Cantidad para la orden: "+cantidadProducto);
  console.log("Producto escogido: "+indiceProducto+" ", body.productos[indiceProducto]);

  var optionsObtenerInventario = {
    url: 'http://'+tiendadir+':'+tiendaport+'/tienda/obtenerInventario',
    method: 'GET',
    json:true,
    body:{cantidad:cantidadProducto, sku:body.productos[indiceProducto].sku}
  };

  request(optionsObtenerInventario, function (error, response, bodyProducto) 
  {
    if (!error && response.statusCode == 200) 
    {
        for(var p in bodyProducto.products)
        {
            console.log(bodyProducto.products[p].sku);
            if(bodyProducto.products[p].sku === body.productos[indiceProducto].sku)
            {
              console.log("TiendaInventario: ", bodyProducto.products[p]) // Print the shortened url.
              console.log(cantidadProducto+" - "+bodyProducto.products[p].inventario);
              if(cantidadProducto <= bodyProducto.products[p].inventario && body.productos[indiceProducto].activo)
              {
                console.log("Colocando orden!");
                colocarOrden(bodyProducto, tiendadir);
              }
              else
              {
                console.log("Orden fallida, no hay suficiente producto para colocar una orden o el producto no esta activo.");
                
                
              }
              break;
            }
          }
        }
        else
        {
          console.log("Ups2!", error);
        }
  });
}

function colocarOrden(producto, tiendadir)
{
  console.log("Colocar orden");
  
  var optionsColocarOrden = {
    url: 'http://'+tiendadir+':'+puerto+'/tienda/colocarOrden',
    method: 'GET',
    json:true,
    body:producto
  };
  request(optionsColocarOrden, function (error, response, bodyResponse) {
    if (!error && response.statusCode == 200) {
      console.log("orden colocada: ", bodyResponse);

      if(bodyResponse.response)
      {
        console.log("True!");
      }
      else
      {
        console.log("False!");
        fallidas++;
      }
      total++;
    }
    else
    {
      console.log("Ups3!", error);
    }
  });
}


async function lanzarPeriodo()
{
  periodo++;
  console.log("Colocando "+config.ordenes+" ordenes");
  console.log("En "+config.tiendas.length+" tiendas");
  console.log("Con "+config.clientes+" clientes");
  for(var i = 0; i< config.clientes; i++)
  {
    start();
  }
}

//console.log("Cliente de la tienda");
//cargarConfiguracion();
//start();
lanzarPeriodo();
