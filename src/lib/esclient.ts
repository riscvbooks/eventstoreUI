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

export async function get_events(pubkey,privkey,offset,limit,callback){
    await client.connect().catch(error => {});

    let event = {    
        "ops": "R",
        "code": 203,
        "user": pubkey,
        "status":0,
        "eventcode":0,
        'offset':offset,
        'limit':limit,
      }
      client.subscribe(secureEvent(event,privkey),function(message){
         
        if (message[2] == "EOSE") client.unsubscribe(message[1]);
        else callback(message[2])
      });      
}

export async function get_users(offset,limit,callback){
    await client.connect().catch(error => {});

    let event = {    
        "ops": "R",
        "code": 103,
        offset,
        limit
      }
      client.subscribe(event,function(message){
         
        if (message[2] == "EOSE") client.unsubscribe(message[1]);
        
        callback(message[2])
      });      
}


export async function get_permissions(pubkeys,callback){
    await client.connect().catch(error => {});

    let event = {    
        "ops": "R",
        "code": 303,
        "data":{"pubkeys":pubkeys}
      }
      client.subscribe(event,function(message){
         
        if (message[2] == "EOSE") client.unsubscribe(message[1]);
        else callback(message[2])
      });      
}

export async function add_permission(data,adminpubkey,adminprivkey,callback){
  await client.connect().catch(error => {});

  let event = {
    
    "ops": "C",
    "code": 300,
  }
  event.data = data;  
  event.user = adminpubkey;

  client.publish(secureEvent(event,adminprivkey),function(message){

      if (message[2] != "EOSE") callback(message[2]);
      
  });      
}

export async function delete_user(user,adminpubkey,adminprivkey,callback){
  await client.connect().catch(error => {});

  let event = {    
    "ops": "D",
    "code": 102,
  }
  event.user = adminpubkey;
  event.data = {pubkey:user}
  client.publish(secureEvent(event,adminprivkey),function(message){     
        if (message[2] != "EOSE") callback(message[2])
  }); 
}

export async function delete_event(eventid,adminpubkey,adminprivkey,callback){
  await client.connect().catch(error => {});

  let event = {    
    "ops": "D",
    "code": 202,
  }
  event.user = adminpubkey;
  event.data = {eventid:eventid}
  client.publish(secureEvent(event,adminprivkey),function(message){     
        if (message[2] != "EOSE") callback(message[2])
  }); 
}

export async function upload_file(filename,fileData,pubkey,privkey,callback){
  await client.connect().catch(error => {});

   
  const event = {
    "ops": "C",
    "code": 400,
    "user": pubkey,
    "data": {
        fileName: filename,  // 生成一个临时文件名
    },
    "tags": [['t','upload_file']]
  };

  const sevent = secureEvent(event,privkey);
  sevent.data.fileData = fileData;
 
  client.publish(sevent,function(message){
    callback(message);
  });

}

export async function create_book(bookInfo,pubkey,privkey,callback){
  await client.connect().catch(error => {});

  let event = {
  
      "ops": "C",
      "code": 200,
      "user": pubkey,
      "data": bookInfo,
      "tags":[ ['t','create_book'],['web','esbook']]
    }
  let sevent = secureEvent(event,privkey);
  callback({code:201,id:sevent.id})
  client.publish(sevent,function(message){
      callback(message[2]);
  });  
}

export async function update_book(bookInfo,bookid,pubkey,privkey,callback){
  await client.connect().catch(error => {});

  await delete_event(bookid,pubkey,privkey,function(e){});

  let event = {
  
      "ops": "C",
      "code": 200,
      "user": pubkey,
      "data": bookInfo,
      "tags":[ ['t','create_book'],['web','esbook'],['d',bookid]]
    }
  let sevent = secureEvent(event,privkey);
 
  client.publish(sevent,function(message){
      callback(message[2]);
  });  
}

export async function get_books(callback){
  
  await client.connect().catch(error => {});
  
  if (client.connected == false) return ;

  let event = {
  
      "ops": "R",
      "code": 203,
      "tags":[ ['t','create_book'],['web','esbook']]
    }
  client.subscribe(event,function(message){
         
      if (message[2] == "EOSE") client.unsubscribe(message[1]);
      
      callback(message[2])
    }); 
}

export async function get_book_id(bookid,callback){
  
  await client.connect().catch(error => {});
  
  if (client.connected == false) return ;

  let event = [{
      "ops": "R",
      "code": 203,
      "tags":[ ['t','create_book'],['web','esbook']],
      "eventid":bookid,
    },
    {
  
      "ops": "R",
      "code": 203,
      "tags":[ ['t','create_book'],['web','esbook'],['d',bookid]],
    }
  ]
  client.subscribe(event,function(message){
         
      if (message[2] == "EOSE") client.unsubscribe(message[1]);
      
      callback(message[2])
    }); 
}

export async function create_chapter(bookId,content,name,pubkey,privkey,callback){
  await client.connect().catch(error => {});

  let event = {
  
      "ops": "C",
      "code": 200,
      "user": pubkey,
      "data": content,
      "tags":[ ['t','create_chapter'],['web','esbook'],['bid',bookId],['d',bookId+'_'+name]]
    }
  let sevent = secureEvent(event,privkey);
  client.publish(sevent,function(message){
      callback(message[2]);
  });  
}

export async function get_chapter(bookId,name,callback){
  await client.connect().catch(error => {});

  let event = { 
      "ops": "R",
      "code": 203,
      "tags":[ ['t','create_chapter'],['web','esbook'],['bid',bookId]]
    }
  if (name){
    event.tags.push(['d',bookId+'_'+name])
  }

  
  client.subscribe(event,function(message){
         
    if (message[2] == "EOSE") client.unsubscribe(message[1]);
    
    callback(message[2])
  });  
}

export async function user_counts(callback){
  await client.connect().catch(error => {});

  let event = { 
    "ops": "R",
    "code": 104,
  }
  client.subscribe(event,function(message){
    if (message[2] == "EOSE") client.unsubscribe(message[1]);
    
    callback(message[2])
  });  
}

export async function event_counts(callback){
  await client.connect().catch(error => {});

  let event = { 
    "ops": "R",
    "code": 204,
  }
  client.subscribe(event,function(message){
    if (message[2] == "EOSE") client.unsubscribe(message[1]);
    
    callback(message[2])
  });  
}