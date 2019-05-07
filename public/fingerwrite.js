var waiting = false;
var waitms = 2000;
$(function(){
  var canvas = document.getElementById( 'mycanvas' );
  if( !canvas || !canvas.getContext ){
    return false;
  }
  var ctx = canvas.getContext( '2d' );

  var mouse = {
    startX: 0,
    startY: 0,
    x: 0,
    y: 0,
    color: 'black',
    isDrawing: false
  };
  var borderWidth = 1;
  canvas.addEventListener( "mousemove", function( e ){
    var rect = e.target.getBoundingClientRect();
    mouse.x = e.clientX - rect.left - borderWidth;
    mouse.y = e.clientY - rect.top - borderWidth;
    waiting = false;

    if( mouse.isDrawing ){
      ctx.beginPath();
      ctx.lineWidth = 20;
      ctx.lineCap = 'round';
      ctx.moveTo( mouse.startX, mouse.startY );
      ctx.lineTo( mouse.x, mouse.y );
      ctx.strokeStyle = mouse.color;
      ctx.stroke();
      mouse.startX = mouse.x;
      mouse.startY = mouse.y;
    }
  });
  canvas.addEventListener( "mousedown", function( e ){
    mouse.isDrawing = true;
    mouse.startX = mouse.x;
    mouse.startY = mouse.y;

    waiting = false;
  });
  canvas.addEventListener( "mouseup", function( e ){
    mouse.isDrawing = false;
    waiting = true;
    setTimeout( 'waited()', waitms );
  });

  canvas.addEventListener( "touchmove", function( e ){
    var t = e.changedTouches[0];
    var rect = t.target.getBoundingClientRect();
    //mouse.x = t.pageX - rect.left - borderWidth;
    //mouse.y = t.pageY - rect.top - borderWidth;
    mouse.x = ( isAndroid() ? t.pageX : e.pageX ) - rect.left - borderWidth;
    mouse.y = ( isAndroid() ? t.pageY : e.pageY ) - rect.top - borderWidth;
    waiting = false;

    if( mouse.isDrawing ){
      ctx.beginPath();
      ctx.lineWidth = 20;
      ctx.lineCap = 'round';
      ctx.moveTo( mouse.startX, mouse.startY );
      ctx.lineTo( mouse.x, mouse.y );
      ctx.strokeStyle = mouse.color;
      ctx.stroke();
      mouse.startX = mouse.x;
      mouse.startY = mouse.y;
    }
  });
  canvas.addEventListener( "touchstart", function( e ){
    var t = e.changedTouches[0];
    var rect = t.target.getBoundingClientRect();
    mouse.isDrawing = true;
    mouse.startX = t.pageX - rect.left - borderWidth;
    mouse.startY = t.pageY - rect.top - borderWidth;
    waiting = false;
  });
  canvas.addEventListener( "touchend", function( e ){
    mouse.isDrawing = false;
    waiting = true;
    setTimeout( 'waited()', waitms );
  });

  //. スクロール禁止
  /*
  $(window).on( 'touchmove.noScroll', function( e ){
    e.preventDefault();
  });
  */
  var movefun = function( event ){
    event.preventDefault();
  }
  window.addEventListener( 'touchmove', movefun, { passive: false } );

  resetCanvas();
});

function resetCanvas(){
  var canvas = document.getElementById( 'mycanvas' );
  if( !canvas || !canvas.getContext ){
    return false;
  }
  var ctx = canvas.getContext( '2d' );

  ctx.beginPath();
  ctx.fillStyle = "rgb( 255, 255, 255 )";
  ctx.fillRect( 0, 0, 300, 300 );
  ctx.stroke();

  waiting = false;
}

function searchChar(){
  var canvas = document.getElementById( 'mycanvas' );
  if( !canvas || !canvas.getContext ){
    return false;
  }
  var ctx = canvas.getContext( '2d' );

  //. 画像データ
  var png = canvas.toDataURL( 'image/png' );
  png = png.replace( /^.*,/, '' );

  //. バイナリ変換
  var bin = atob( png );
  var buffer = new Uint8Array( bin.length );
  for( var i = 0; i < bin.length; i ++ ){
    buffer[i] = bin.charCodeAt( i );
  }
  var blob = new Blob( [buffer.buffer], {
    type: 'image/png'
  });

  var formData = new FormData();
  formData.append( 'image', blob );

  $.ajax({
    type: 'POST',
    url: './upload',
    data: formData,
    contentType: false,
    processData: false,
    success: function( data, dataType ){
      //console.log( data );
      data = JSON.parse( data );
      if( data.status ){
        if( data.result && data.result.values && data.result.values.length ){
          console.log( data.result.values );
          var values = data.result.values[0];
          var max = 0.0;
          var idx = -1;
          for( var i = 0; i < values.length; i ++ ){
            if( values[i] > max ){
              max = values[i];
              idx = i;
            }
          }

          if( idx > -1 ){
            //alert( idx + '(' + max + ')' );
            alert( idx + '' );
          }
        }else if( data.errors && data.errors.length ){
          console.log( data.errors );
          alert( data.errors[0].message );
        }else{
          console.log( data );
          alert( 'unknown error' );
        }
      }
    },
    error: function( jqXHR, textStatus, errorThrown ){
      console.log( textStatus + ": " + errorThrown );
    }
  });
}

function debugText( txt ){
  $('#debug').html( txt );
}

function waited(){
  if( waiting ){
    waiting = false;
    //searchChar();
  }
}

function isAndroid(){
  return ( navigator.userAgent.indexOf( 'Android' ) > 0 );
}
