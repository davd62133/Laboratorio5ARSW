/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package edu.eci.arsw.collabpaint.controller;

import edu.eci.arsw.collabpaint.model.Point;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

/**
 *
 * @author 2123162
 */
@Controller
public class MessageController {
    
    @Autowired
    SimpMessagingTemplate msgt;
    
    ConcurrentHashMap<String, List<Point>> puntos = new ConcurrentHashMap<>();
    
    @MessageMapping("/newpoint.{numdibujo}")    
    public void handlePointEvent(Point pt,@DestinationVariable String numdibujo) throws Exception {
	System.out.println("Nuevo punto recibido en el servidor!:"+pt);
        //msgt.convertAndSend("/topic/newpoint."+numdibujo, pt);  
        poligono(pt, numdibujo);
    }
    
    private void poligono(Point pt, String numdibujo){
        if(puntos.containsKey(numdibujo)){   
            puntos.get(numdibujo).add(pt);
            if(puntos.get(numdibujo).size()>=4){                
                msgt.convertAndSend("/topic/newpolygon."+numdibujo, puntos.get(numdibujo));
                puntos.get(numdibujo).clear();  
            }
        }else{
            List<Point> temp = new ArrayList<>();
            temp.add(pt);
            puntos.put(numdibujo, temp);
        }
    }
}
