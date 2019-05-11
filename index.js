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
const config = require('./config/esbconf.json');
//console.log(config.Nodos);
//---------------------------------------
//--------------Globales-----------------
var tabla = [];
var tengoPIM = false;
var dirPIM = "localhost";
var puerto = 8080;
var rebote = "2";
var authdir = "35.243.184.92";
var authport = 8086;
var pimdir = "35.235.77.214";
var pimport = 8082;

const optionsAuth = {
  url: "http://"+authdir + ":" + authport + "/getToken",
  method:'POST',
  json: true, 
  body://req.body
      { 
        //client_id: req.body.client_id,
        //client_secret: req.body.client_secret
        client_id: 1,
        client_secret: "secret1"
       }
  };
//---------------------------------------

app.listen(puerto, function () {
  console.log('Servidor web en el puerto '+puerto+'!');
});

app.get('/', function (req, res) {
  res.send('ESB corriendo...');
});

app.get('/PIM/obtenerCatalogo2', function (req, res) {

  res.send({mensaje:"ok"});
  return;
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
  //res.send(JSON.stringify(arregloRespuesta));
});

app.get('/PIM/obtenerCatalogo', function (req, res) 
{
  request(optionsAuth,  (err, responseAuth, bodyAuth2) => 
    {
      if (err) { return console.log(err); }
      //console.log(body.access_token);
      if(bodyAuth2.success)
      {
        console.log("*** Se intentó un acceso no autorizado: incorrecto client_id o client_secret");
        res.send("Credenciales incorrectas");
      }
      else
      {
        console.log("paso1");
        if(!bodyAuth2.scope.includes("/PIM/obtenerCatalogo"))
        {
          res.send('No se tiene acceso al metodo.');
          return;
        }
        const options2 = {
          url: "http://"+authdir + ":" + authport + "/validateToken",
          method:'GET',
          json:true,
          headers:{
            'Authorization':bodyAuth2.access_token
          }
        };
        request(options2,  (err, responseAuth2, bodyAuth2) => 
        {
          if (err) { return console.log(err); }
          if(bodyAuth2.success)
          {
            if(tengoPIM)
            {
              //ES ESTE MISMO PIM
              //Metodo con direccion del pim
              //res.send('MI PIM');
              var options = {
                url: "http://"+pimdir + ":" + pimport + "/PIM/obtenerCatalogo",
                method:'GET',
                json:true
                /*headers: {
                    'Accept': 'application/json',
                    'Accept-Charset': 'utf-8',
                }*/
              };
              request(options,  (err, response, body) => 
                {
                  if (err) { return console.log(err); }
                  //console.log(body);
                  res.send(body);
                });
            }
            else
            {
                //ES OTRO PIM
                var nodoPIM = getPIM();
                console.log("Redirigiendo a:" + nodoPIM.nodo + ":" + puerto + "/PIM/obtenerCatalogo"+rebote);
                
          
      var options = {
        url: "http://"+nodoPIM.nodo + ":" + puerto + "/PIM/obtenerCatalogo"+rebote,
        method:'GET',
        json:true
        /*headers: {
            'Accept': 'application/json',
            'Accept-Charset': 'utf-8',
        }*/
      };
                request(options,  (err, response, body) => 
                {
                  if (err) { return console.log(err); }
                  //console.log(body);
                  res.send(body);
                });
            }
          }
          else
          {
            console.log("Token incorrecto: ", bodyAuth2);
            res.send("Token Incorrecto");
          }
        });
      }
    });
});

app.get('/PIM/enriquecerProducto', function (req, res) {

    request(optionsAuth,  (err, responseAuth, bodyAuth2) => 
      {
        if (err) { return console.log(err); }
        //console.log(body.access_token);
        if(bodyAuth2.success)
        {
          console.log("*** Se intentó un acceso no autorizado: incorrecto client_id o client_secret");
          res.send("Credenciales incorrectas");
        }
        else
        {
          if(!bodyAuth2.scope.includes("/PIM/enriquecerProducto"))
          {
            res.send('No se tiene acceso al metodo.');
            return;
          }
          const options2 = {
            url: "http://"+authdir + ":" + authport + "/validateToken",
            method:'GET',
            json:true,
            headers:{
              'Authorization':bodyAuth2.access_token
            }
          };
          request(options2,  (err, responseAuth2, bodyAuth2) => 
          {
            if (err) { return console.log(err); }
            if(bodyAuth2.success)
            {
              //----------------------------------
              console.log("> "+req.body.length);
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
              //-------------------------------------
            }
            else
            {
              console.log("Token incorrecto: ", bodyAuth2);
              res.send("Token Incorrecto");
            }
          });
        }
      });
});

app.get('/Bodega/obtenerInventario', function (req, res) {
  
  request(optionsAuth,  (err, responseAuth, bodyAuth2) => 
    {
      if (err) { return console.log(err); }
      //console.log(body.access_token);
      if(bodyAuth2.success)
      {
        console.log("*** Se intentó un acceso no autorizado: incorrecto client_id o client_secret");
        res.send("Credenciales incorrectas");
      }
      else
      {
        if(!bodyAuth2.scope.includes("/Bodega/obtenerInventario"))
        {
          res.send('No se tiene acceso al metodo.');
          return;
        }
        const options2 = {
          url: "http://"+authdir + ":" + authport + "/validateToken",
          method:'GET',
          json:true,
          headers:{
            'Authorization':bodyAuth2.access_token
          }
        };
        request(options2,  (err, responseAuth2, bodyAuth2) => 
        {
          if (err) { return console.log(err); }
          if(bodyAuth2.success)
          {
            //console.log(req.body.destino);
            var nodo = tabla[req.body.destino];
            console.log("/Bodega/obtenerInventario: redirigiendo a:" + nodo.nodo + ":" + puerto + "/Bodega/obtenerInventario"+rebote);
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
          }
          else
          {
            console.log("Token incorrecto: ", bodyAuth2);
            res.send("Token Incorrecto");
          }
        });
      }
    });
});

app.get('/Bodega/realizarDespacho', function (req, res) {
  
  request(optionsAuth,  (err, responseAuth, bodyAuth2) => 
    {
      if (err) { return console.log(err); }
      //console.log(body.access_token);
      if(bodyAuth2.success)
      {
        console.log("*** Se intentó un acceso no autorizado: incorrecto client_id o client_secret");
        res.send("Credenciales incorrectas");
      }
      else
      {
        if(!bodyAuth2.scope.includes("/Bodega/realizarDespacho"))
        {
          res.send('No se tiene acceso al metodo.');
          return;
        }
        const options2 = {
          url: "http://"+authdir + ":" + authport + "/validateToken",
          method:'GET',
          json:true,
          headers:{
            'Authorization':bodyAuth2.access_token
          }
        };
        request(options2,  (err, responseAuth2, bodyAuth2) => 
        {
          if (err) { return console.log(err); }
          if(bodyAuth2.success)
          {
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
                
          }
          else
          {
            console.log("Token incorrecto: ", bodyAuth2);
            res.send("Token Incorrecto");
          }
        });
      }
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
    url: 'http://35.245.176.14:'+puerto+'/Bodega/obtenerInventario',
    method: 'GET',
    /* */
    json:true,
    body:body
    /* */
  };

  var retorno = request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log("Fin: ", body) // Print the shortened url.
      return false;
    }
    else
    {
      console.log("ups!", error);
      return true;
    }
  });
  //console.log("->", retorno);
}


function cargarNodos()
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

cargarNodos();
//test();

/*
const optionsAuth = {
    url: "http://"+authdir + ":" + authport + "/getToken",
    method:'POST',
    json: true, 
    body://req.body
        { 
          //client_id: req.body.client_id,
          //client_secret: req.body.client_secret
          client_id: 1,
          client_secret: "secret1"
         }
    };
    request(optionsAuth,  (err, responseAuth, bodyAuth2) => 
      {
        if (err) { return console.log(err); }
        //console.log(body.access_token);
        if(bodyAuth2.success)
        {
          console.log("*** Se intentó un acceso no autorizado: incorrecto client_id o client_secret");
          res.send("Credenciales incorrectas");
        }
        else
        {
          const options2 = {
            url: "http://"+authdir + ":" + authport + "/validateToken",
            method:'GET',
            json:true,
            headers:{
              'Authorization':bodyAuth2.access_token
            }
          };
          request(options2,  (err, responseAuth2, bodyAuth2) => 
          {
            if (err) { return console.log(err); }
            if(bodyAuth2.success)
            {
              
            }
            else
            {
              console.log("Token incorrecto: ", bodyAuth2);
              res.send("Token Incorrecto");
            }
          });
        }
      });
*/