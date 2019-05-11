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

var puerto = 3001;
var rebote = "2";

//---------------------------------------
//--------------Reportes-----------------
var fallidas = 0;
var total = 0;
var tiempos = [];
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
        sku:"sku3",
        inventario:100,
      }
    ]
  };
  res.send(body);
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


//------------CLIENTE-----------------
// Consultar catalogo (categorias)
// Seleccionar un producto random
// Consultar disponibilidad
//http://localhost:1234/tienda/colocarOrden (producto aleatorio de la 1era consulta, cantidad aleatoria según conf)


//------------------------------------

function test()
{
  console.log("cliente test:");
  //Consultar categorias
  var body = {};
  
  var optionsObtenerCatalogo = {
    url: 'http://localhost:'+puerto+'/tienda/obtenerCatalogo',
    method: 'GET',
    json:true,
    body:body
  };

  request(optionsObtenerCatalogo, function (error, response, body) {
    if (!error && response.statusCode == 200) 
    {
      console.log("Fin: ", body) // Print the shortened url.
      consultarInventario(body);
    }
    else
    {
      console.log("Ups!", error);
    }
  });
}

function consultarInventario(body)
{
  var cantidadProducto = Math.floor(Math.random() * (+config.rangoFinalCantidadProductos - +config.rangoInicialCantidadProductos)) + +config.rangoInicialCantidadProductos;
  var indiceProducto = Math.floor(Math.random() * (+body.productos.length - +0)) + +0;
  console.log("Cantidad para la orden: "+cantidadProducto);
  console.log("Producto escogido: "+indiceProducto+" "+body.productos[indiceProducto]);

  var optionsObtenerInventario = {
    url: 'http://localhost:'+puerto+'/tienda/obtenerInventario',
    method: 'GET',
    json:true,
    body:body
  };

  request(optionsObtenerInventario, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log("TiendaInventario: ", body) // Print the shortened url.
      console.log(body.products[0].inventario);
      if(cantidadProducto <= body.products[0].inventario)
      {
        console.log("Colocando orden!");
        total++;
      }
      else
      {
        console.log("Orden fallida, no hay suficiente producto para colocar una orden.");
        fallidas++;
        total++;
      }
    }
    else
    {
      console.log("Ups!", error);
    }
  });
}


function checkOrigen(destino)
{
  if(destino === config.Actual)
  {
    return true;
  }
  return false;
}


console.log("Cliente de la tienda");
//cargarConfiguracion();
test();