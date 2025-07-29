import {esserver} from "./config"

import {    
    generateSecretKey,
    getPublicKey,
    verifyEvent,
    esecEncode,
    esecDecode,
    epubEncode,
    epubDecode,
    secureEvent} from "eventstore-tools/src/key";

import {WebSocketClient } from "eventstore-tools/src/WebSocketClient";

let client =  new WebSocketClient(esserver);
 
export async function create_user(email,pubkey,privkey,callback){
    await client.connect().catch(error => {});

    let event = {
    
        "ops": "C",
        "code": 100,
        "user": pubkey,
        "data": {
          "email": email,
        }
      }
    client.publish(secureEvent(event,privkey),function(message){
        callback(message);
    });  
}

export async function get_events(callback){
    await client.connect().catch(error => {});

    let event = {    
        "ops": "R",
        "code": 203,
      }
      client.subscribe(event,function(message){
         
        if (message[2] == "EOSE") client.unsubscribe(message[1]);
        else callback(message[2])
      });      
}

export async function get_users(callback){
    await client.connect().catch(error => {});

    let event = {    
        "ops": "R",
        "code": 103,
      }
      client.subscribe(event,function(message){
         
        if (message[2] == "EOSE") client.unsubscribe(message[1]);
        else callback(message[2])
      });      
}


export async function get_permissions(callback){
    await client.connect().catch(error => {});

    let event = {    
        "ops": "R",
        "code": 303,
      }
      client.subscribe(event,function(message){
         
        if (message[2] == "EOSE") client.unsubscribe(message[1]);
        else callback(message[2])
      });      
}