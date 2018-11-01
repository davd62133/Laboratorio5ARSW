var app = (function () {

    class Point{
        constructor(x,y){
            this.x=x;
            this.y=y;
        }        
    }
    
    var stompClient = null;
	var num = null;

    var addPointToCanvas = function (point) {        
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.stroke();
		
    };
	
	var addPolygonToCanvas = function(body){	
		var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
		ctx.fillStyle = "rgb(41,155,243)";
		ctx.beginPath();
		ctx.moveTo(body[0].x, body[0].y);
		for(var i = 0; i<body.length;i++){
			//addPointToCanvas(body[i]);
			console.log(body[i].x);			
			ctx.lineTo(body[i].x, body[i].y);			
		}		
		ctx.closePath();
		ctx.fill();		
	}
    
    
    var getMousePosition = function (evt) {
        canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };


    var connectAndSubscribe = function () {
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);
        
        //subscribe to /topic/TOPICXX when connections succeed
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            stompClient.subscribe('/topic/newpolygon.'+num, function (eventbody) {
				//alert("Evento Recibido");
                //var pt=JSON.parse(eventbody.body);
				//addPointToCanvas(pt);
				//console.log(eventbody);
				addPolygonToCanvas(JSON.parse(eventbody.body));				
            });
        });

    };
	
	var publishEvent = function (pt){
		stompClient.send("/app/newpoint."+num, {}, JSON.stringify(pt));
	};       

    return {

        init: function () {
            var can = document.getElementById("canvas");
			var aceptar = true;
			while(aceptar){
				num = prompt("Ingresar el numero del dibujo");
				if(!(num == null || null == "")){
					aceptar = false;
				}
			}
            //websocket connection
            connectAndSubscribe(num);
        },

        publishPoint: function(px,py){
            var pt=new Point(px,py);
            console.info("publishing point at "+pt);
            addPointToCanvas(pt);

            //publicar el evento
			publishEvent(pt);
        },

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            setConnected(false);
            console.log("Disconnected");
        }
    };

})();

document.onmousedown = function(e){
	app.publishPoint(e.pageX, e.pageY);
}