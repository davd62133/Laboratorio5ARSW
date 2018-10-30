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
            stompClient.subscribe('/topic/newpoint.'+num, function (eventbody) {
				//alert("Evento Recibido");
                var pt=JSON.parse(eventbody.body);
				addPointToCanvas(pt);
            });
        });

    };
	
	var publishEvent = function (pt){
		stompClient.send("/topic/newpoint."+num, {}, JSON.stringify(pt));
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