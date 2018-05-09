//.  app.js
var express = require( 'express' ),
    basicAuth = require( 'basic-auth-connect' ),
    btoa = require( 'btoa' ),
    Canvas = require( 'canvas' ),
    cfenv = require( 'cfenv' ),
    multer = require( 'multer' ),
    bodyParser = require( 'body-parser' ),
    fs = require( 'fs' ),
    easyimg = require( 'easyimage' ),
    ejs = require( 'ejs' ),
    request = require( 'request' ),
    app = express();
var settings = require( './settings' );
var appEnv = cfenv.getAppEnv();
var Image = Canvas.Image;

var XMLHttpRequest = require( 'xmlhttprequest' ).XMLHttpRequest;


app.use( multer( { dest: './tmp/' } ).single( 'image' ) );
//app.use( multer( { dest: './public/' } ).single( 'image' ) );
app.use( bodyParser.urlencoded( { extended: true } ) );
app.use( bodyParser.json() );
app.use( express.static( __dirname + '/public' ) );

app.post( '/upload', function( req, res ){
  var src_filepath = req.file.path;
  var filetype = req.file.mimetype;
  var originalname = req.file.originalname;

  //. https://www.npmjs.com/package/easyimage
  var dst_filepath = src_filepath + '.png';
  var options = {
    src: src_filepath,
    dst: dst_filepath,
    width: 28,
    height: 28
  };

  easyimg.resize( options ).then(
    function( file ){
      getPredictions( dst_filepath ).then( function( result ){
        fs.unlink( src_filepath, function(e){} );
        fs.unlink( dst_filepath, function(e){} );
        res.write( JSON.stringify( { status: true, result: result }, 2, null ) );
        res.end();
      }, function( err ){
        fs.unlink( src_filepath, function(e){} );
        fs.unlink( dst_filepath, function(e){} );
        res.write( JSON.stringify( { status: false, error: err }, 2, null ) );
        res.end();
      });
    }, function( error ){
      getPredictions( dst_filepath ).then( function( result ){
        fs.unlink( src_filepath, function(e){} );
        fs.unlink( dst_filepath, function(e){} );
        res.write( JSON.stringify( { status: true, result: result }, 2, null ) );
        res.end();
      }, function( err ){
        fs.unlink( src_filepath, function(e){} );
        fs.unlink( dst_filepath, function(e){} );
        res.write( JSON.stringify( { status: false, error: err }, 2, null ) );
        res.end();
      });
    }
  );
});


function getPredictions( filepath ){
  return new Promise( function( resolve, reject ){
    fs.readFile( filepath, function( err, data ){
      if( err ){
        reject( err );
      }else{
        var lines = [];
        var img = new Image;
        img.src = data;
        var canvas = new Canvas( 28, 28 );
        var ctx = canvas.getContext( '2d' );
        ctx.drawImage( img, 0, 0, img.width, img.height );

        var imagedata = ctx.getImageData( 0, 0, img.width, img.height );

        for( var y = 0; y < imagedata.height; y ++ ){
          var line = [];
          for( var x = 0; x < imagedata.width; x ++ ){
            var idx = ( y * imagedata.width + x ) * 4;
            var R = imagedata.data[idx];
            var G = imagedata.data[idx+1];
            var B = imagedata.data[idx+2];
            var A = imagedata.data[idx+3];

            R = 255 - R;
            G = 255 - G;
            B = 255 - B;

            var avg = ( R + G + B ) / ( 3.0 * 255.0 );
            avg = Math.floor( avg * 100 ) / 100.0;
            var v = [ avg ];
            line.push( v );
          }
          lines.push( line );
        }

        var values = [ lines ];

        //. Scoring End-point URL from IBM Watson Studio instance
        const scoring_url = settings.ws_endpoint;

        var payload = {};
        payload['values'] = values;
        payload['fields'] = [ 'prediction' ];
        payload = JSON.stringify( payload );

        apiGet( settings.wml_url, settings.wml_username, settings.wml_password, function ( res ){
          var parsedGetResponse;
          try{
            parsedGetResponse = JSON.parse( this.responseText );
          }catch( ex ){
            // TODO: handle parsing exception
          }

          if( parsedGetResponse && parsedGetResponse.token ){
            const token = parsedGetResponse.token
            const wmlToken = "Bearer " + token;

            apiPost( scoring_url, wmlToken, payload, function (resp) {
              var parsedPostResponse;
              try{
                parsedPostResponse = JSON.parse(this.responseText);
              } catch (ex) {
                // TODO: handle parsing exception
              }
              //console.log("Scoring response");
              //console.log(parsedPostResponse);
              resolve( parsedPostResponse );
            }, function (error) {
              console.log(error);
              reject( error );
            });
          }else{
            reject( null );
          }
        });
      }
    });
  });
}

function apiGet(url, username, password, loadCallback, errorCallback){
	const oReq = new XMLHttpRequest();
	const tokenHeader = "Basic " + btoa((username + ":" + password));
	const tokenUrl = url + "/v3/identity/token";

	oReq.addEventListener("load", loadCallback);
	oReq.addEventListener("error", errorCallback);
	oReq.open("GET", tokenUrl);
	oReq.setRequestHeader("Authorization", tokenHeader);
	oReq.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	oReq.send();
}

function apiPost(scoring_url, token, payload, loadCallback, errorCallback){
	const oReq = new XMLHttpRequest();
	oReq.addEventListener("load", loadCallback);
	oReq.addEventListener("error", errorCallback);
	oReq.open("POST", scoring_url);
	oReq.setRequestHeader("Accept", "application/json");
	oReq.setRequestHeader("Authorization", token);
	oReq.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	oReq.send(payload);
}


var port = appEnv.port || 3000;
app.listen( port );
console.log( "server starting on " + port + " ..." );
