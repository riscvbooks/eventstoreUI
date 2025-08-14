import {esserver} from "./config"

import {    
    generateSecretKey,
    getPublicKey,
    verifyEvent,
    esecEncode,
    esecDecode,
    epubEncode,
    epubDecode,
    secureEvent,
    hashMessage} from "eventstore-tools/src/key";





import {WebSocketClient } from "eventstore-tools/src/WebSocketClient";

let client =  new WebSocketClient(esserver);

function getId(tempEvent){
  return hashMessage(JSON.stringify(tempEvent))
}

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

  let bookId = getId({pubkey,time:Math.floor(Date.now())})
 

  let event = {
  
      "ops": "C",
      "code": 200,
      "user": pubkey,
      "data": bookInfo,
      "tags":[ ['t','create_book'],['web','esbook'],['d',bookId]]
    }
  
  if (bookInfo.labels) event.labels = bookInfo.labels;

  let sevent = secureEvent(event,privkey);


  callback({code:201,id:bookId})
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
  if (bookInfo.labels) event.labels = bookInfo.labels;  
  
  let sevent = secureEvent(event,privkey);
 
  client.publish(sevent,function(message){
      callback(message[2]);
  });  
}

export async function get_books(pubkey,callback){
  
  await client.connect().catch(error => {});
  
 

  let event = {
  
      "ops": "R",
      "code": 203,
      "tags":[ ['t','create_book'],['web','esbook']]
    }

  if (pubkey) event.eventuser = pubkey;

  client.subscribe(event,function(message){
         
      if (message[2] == "EOSE") client.unsubscribe(message[1]);
      
      callback(message[2])
    }); 
}

export async function get_book_id(bookid,callback){
  
  await client.connect().catch(error => {});
  
 

  let event = 
    {
  
      "ops": "R",
      "code": 203,
      "tags":[ ['t','create_book'],['web','esbook'],['d',bookid]],
    }
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

export async function save_user_profile(profile,pubkey,privkey,callback){
  await client.connect().catch(error => {});

  let event = {
  
    "ops": "C",
    "code": 200,
    "user": pubkey,
    "data": JSON.stringify(profile),
    "tags":[ ['d','profile'] ]
  }
  let sevent = secureEvent(event,privkey);
  client.publish(sevent,function(message){
      if (message[2] != "EOSE")
        callback(message[2]);
  });

}

export async function get_user_profile(pubkey,callback){
  await client.connect().catch(error => {console.log(error)});
 
 
  let event = {
  
    "ops": "R",
    "code": 203,
    "eventuser": pubkey,
    "tags":[ ['d','profile'] ]
  }
  
  client.subscribe(event,function(message){
  
    if (message[2] == "EOSE") client.unsubscribe(message[1]);
    else callback(message[2])
  });

}

export async function create_blog(blogData,pubkey,privkey,callback){
  await client.connect().catch(error => {});

  let isDraft = false;
  let blogId = getId({pubkey,time:Math.floor(Date.now())})

  let event = {
  
      "ops": "C",
      "code": 200,
      "user": pubkey,
      "data": blogData,
      "tags":[ ['t','create_blog'], ['d',blogId],
               ['s', isDraft ? 'draft' : 'published']  // 新增状态标签
            ]
    }
  if (blogData.labels) event.labels = blogData.labels; 

  let sevent = secureEvent(event,privkey);
  client.publish(sevent,function(message){
      callback(message[2]);
  });  
}

export async function get_blog_id(blogid,callback){
  
  await client.connect().catch(error => {});
  
  let event = {
      "ops": "R",
      "code": 203,
      "tags":[ ['t','create_blog'], ['d',blogid]],
      
    }
 
  client.subscribe(event,function(message){
         
      if (message[2] == "EOSE") client.unsubscribe(message[1]);
      
      callback(message[2])
    }); 
}

export async function get_blogs(pubkey,isDraft=1,callback){
  
  await client.connect().catch(error => {});
  
  let event = {
      "ops": "R",
      "code": 203,
      "tags":[ ['t','create_blog'], ],
    };
  if (isDraft == 1)
    event.tags.push(['s', 'draft'])
  
  if (isDraft == 2)
    event.tags.push(['s', 'published'])

  // isDraft 是其他值，就不填写 status标志，也就是查询所有的。例如 isDraft=0;

  if (pubkey) event['eventuser'] = pubkey;

  client.subscribe(event,function(message){
         
      if (message[2] == "EOSE") client.unsubscribe(message[1]);
      
      callback(message[2])
    }); 
}