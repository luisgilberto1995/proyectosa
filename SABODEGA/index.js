'use strict';

var mysql = require('mysql');
var request = require('request');

const initConf = require('./conf/conf.json');

const port = 8083;
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
var request = require('request');

//-------------GLOBALES--------------
var periodo = 0;
var bodyGeneral = {client_id:1, client_secret:"secret2"}
var esbdir = "35.245.176.14";
var esbport = 8081;
var limInferior = 0;
var limSuperior = 100;
var reporte1noinventario = [];
var reporte1inventario = [];
var reporteSolicitudes = [];
//-----------------------------------

var con = mysql.createConnection({
    //host: process.env.DATABASE_HOST || 'ec2-54-163-173-31.compute-1.amazonaws.com',
    host:'127.0.0.1',
    user: "root",
    password: "root",
    database: "bodegadb"
});

con.connect(function(err) {
    if (err) throw err;
    console.log('conected to MySQL database!');

});

app.get('/Bodega/obtenerInventario', (req, res)=>{
    var body = req.body;
    if(!body){console.log("no hay body valido"); res.send("no hay body valido"); return;}
    
    var arreglo = req.body.arreglo;
    if(!arreglo){console.log("no hay arreglo valido"); res.send("no hay body valido"); return;}
    var indice = 0;
    var products = [];

    arreglo.forEach(function(producto)
    {
        var selectquery = "SELECT inventario FROM producto WHERE sku = '"+producto+"';";
        con.query(selectquery, function (err, result) 
        {
            //console.log(result);
            result.forEach(function (element) 
            {
                //console.log(element.inventario);
                products.push({sku: producto, inventario: element.inventario});
                if(indice >= arreglo.length - 1)
                {
                    var respuesta = {products: products};
                    res.send(respuesta);
                }
            });
            indice++;
        });
    });
});

app.post('/Bodega/realizarDespacho', (req, res)=>
{
    var productoDespacho = req.body;
    if(!productoDespacho){console.log("body invalido");res.send("body invalido");return;}
    var sku = productoDespacho.sku;
    var cantidad = productoDespacho.cantidad;
    var direccion = productoDespacho.direccion;

    var selectquery = "SELECT inventario FROM producto WHERE sku = '"+sku+"';";
    con.query(selectquery, function (err, result) 
    {
        //console.log(result);
        result.forEach(function (element) 
        {
            //console.log(element.inventario);
            console.log(cantidad+" - "+element.inventario);
            if(cantidad <= element.inventario)
            {
                //success
                res.send({resultado:true});
                var updatequery = "UPDATE producto SET inventario = "+(element.inventario - cantidad)+" WHERE sku = '"+sku+"'";
                con.query(updatequery, function (err, result) 
                {
                    if(err){console.log(err);}
                    else{console.log("Updated...");}
                })
            }
            else
            {
                //failure
                res.send({resultado:false});
            }
            products.push({sku: producto, inventario: element.inventario});
            if(indice >= arreglo.length - 1)
            {
                var respuesta = {products: products};
                res.send(respuesta);
            }
        });
    });
});


app.get('/', (req, res)=>
{
   correrPeriodo();

  res.send('\n\nRealizando cambio de periodo')
});

app.get('/repote/periodo',(req,res)=>{
    var sql = "SELECT COUNT(periodo) AS total ,tipo, periodo FROM reporte group by tipo,periodo order by tipo;";
    var ret = "Se crearon 25 productos\n";
    con.query(sql, function (err, result)
    {
        var periodo =0;
        var total=25;
        var x =0;
        result.forEach(function (element) {

            if(element.tipo==1)
            {
                ret+= "durante el periodo "+element.periodo+" se insertaron "+element.total+" productos con inventario\n";
            }
            else if(element.tipo==2)
            {
                ret+= "durante el periodo "+element.periodo+" se insertaron "+element.total+"productos sin inventario\n";
            }
            else if(element.tipo==3)
            {
                ret+= "durante el periodo "+element.periodo+" se consulto "+element.total+" veces obtener inventario\n";
            }
            else if(element.tipo==4)
            {
                ret+= "durante el periodo "+element.periodo+" se despachó "+element.total+" veces correctamente\n";
            }
            else
            {
                ret+= "durante el periodo "+element.periodo+" se no se pudo despachar "+element.total+" veces\n";
            }
            x++;
            if(x==result.length)
            {
                res.send(ret);
            }
        });
    });


});

app.get('/repote/tienda',(req,res)=>{
    var sql = "SELECT COUNT(tienda) AS total ,tipo,tienda FROM reporte group by tipo,tienda order by tipo;";
    var ret = "Se crearon 25 productos\n";
    con.query(sql, function (err, result)
    {
        var periodo =0;
        var total=25;
        var x =0;
        result.forEach(function (element) {

            if(element.tipo==3)
            {
                ret+= "desde la tienda "+element.tienda+" se consulto "+element.total+" veces obtener inventario\n";
            }
            else if(element.tipo==4)
            {
                ret+= "desde la tienda "+element.tienda+" se despachó "+element.total+" veces correctamente\n";
            }
            else if(element.tipo==5)
            {
                ret+= "desde la tienda "+element.tienda+" se no se pudo despachar "+element.total+" veces\n";
            }
            x++;
            if(x==result.length)
            {
                res.send(ret);
            }
        });
    });


});

app.get('/repote/total',(req,res)=>{
    var sql = "SELECT COUNT(tienda) AS total ,tipo FROM reporte group by tipo order by tipo;";
    var ret = "Se crearon 25 productos\n";
    con.query(sql, function (err, result)
    {
        var periodo =0;
        var total=25;
        var x =0;
        result.forEach(function (element) {
            if(element.tipo==1)
            {
                ret+= "Se insertaron en total "+element.total+" productos con inventario\n";
            }
            else if(element.tipo==2)
            {
                ret+= "Se insertaron en total "+element.total+"productos sin inventario\n";
            }
            else if(element.tipo==3)
            {
                ret+= "Se consulto en total  "+element.total+" veces obtener inventario\n";
            }
            else if(element.tipo==4)
            {
                ret+= "Se despachó en total "+element.total+" veces correctamente\n";
            }
            else
            {
                ret+= "No se pudo despachar en total "+element.total+" veces\n";
            }

            x++;
            if(x==result.length)
            {
                res.send(ret);
            }
        });
    });


});

app.listen(port, function () {
    console.log("Escuchando en el puerto: "+ port);
});


function correrPeriodo() 
{
    console.log("\n\nCorriendo periodo...")
    periodo++;
    var deletequery = "DELETE FROM producto";
    con.query(deletequery, function (err, result) {
        var options = {
            url: 'http://' + esbdir + ':' + esbport + '/PIM/obtenerCatalogo', 
            json:true, 
            body: bodyGeneral
        };
        request.get(options, function (error, response, body) {
            var catalogo = body;
            //console.log(body);
            
            body.productos.forEach(function(producto)
            {
                var cantidad = Math.floor(Math.random() * (+limSuperior - +limInferior)) + +limInferior;
                if(cantidad < 50){cantidad = 0;}
                var insertquery = "INSERT INTO producto VALUES ('"+producto.sku+"',"
                +cantidad+");";
                con.query(insertquery, function (err, result) 
                {
                    if(cantidad === 0)
                    {
                        if(!reporte1noinventario[periodo])
                        {
                            reporte1noinventario[periodo] = 1;
                        }
                        else
                        {
                            reporte1noinventario[periodo]++;
                        }
                    }
                    else
                    {
                        if(!reporte1inventario[periodo])
                        {
                            reporte1inventario[periodo] = 1;
                        }
                        else
                        {
                            reporte1inventario[periodo]++;
                        }
                    }
                    console.log("Random realizado: "+producto.sku+" "+cantidad);
                });
            });
            
        });
    });
}

correrPeriodo();