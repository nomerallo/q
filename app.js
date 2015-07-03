var express = require('express');       
var path = require('path');
var favicon = require('serve-favicon');         //Importar paquetes con middlewares
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var partials = require('express-partials');
var methodOverride = require('method-override');
var session = require('express-session');

var routes = require('./routes/index');         //importar enrutadores
//var users = require('./routes/users');

var app = express();    //creamos la aplicacion con factoría de objetos

// view engine setup
app.set('views', path.join(__dirname, 'views'));    //instala generador de vistas EJS
app.set('view engine', 'ejs');

app.use(partials());

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));        //instala middlewares
//app.use(bodyParser.urlencoded()); 
app.use(cookieParser('Quiz 2015'));	//añadir semilla para cifrar cookie
app.use(session());	//instalamos middleware de sesión
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));


//tiempo de sesion
app.use(function(req, res, next) {
    if(req.session.user){ // si estamos en una sesion logeada
        if(!req.session.marcatiempo){ //primera vez se pone la marca de tiempo
            req.session.marcatiempo=(new Date()).getTime();
       	}else{
            if((new Date()).getTime()-req.session.marcatiempo > 120000){//se pasó el tiempo y eliminamos la sesión (2min=120000ms)
                //console.log('Tiempo de sesión agotado');
                delete req.session.user;     //eliminamos el usuario
            }else{//hay actividad se pone nueva marca de tiempo
                req.session.marcatiempo=(new Date()).getTime();
            }
        }
    }
    next();
});




// catch 404 and forward to error handler
app.use(function(req, res, next) {          //resto de rutas, genera error 404 HTTP
    
	//guardar path en session.redir para despues de login
	if(!req.path.match(/\/login|\/logout/)){
		req.session.redir = req.path;
	}

	// hacer visible req.session en las vistas
	res.locals.session = req.session;
	next();

    //var err = new Error('Not Found');
    //err.status = 404;
    //next(err);
});

app.use('/', routes);       //instala enrutadores

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {     //gestión de errores durante el desarrollo
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err,
            errors: []
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {         //gestión de errores de producción
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {},
        errors: []
    });
});


module.exports = app;       //exportar app para comando de arranque
