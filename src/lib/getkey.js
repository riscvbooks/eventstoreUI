import {WebStorage} from "./WebStorage"
import {    
    generateSecretKey,
    getPublicKey,
    verifyEvent,
    esecEncode,
    esecDecode,
    epubEncode,
    epubDecode,
    secureEvent} from "eventstore-tools/src/key";

export function getKey(){
    let Keypriv = null;
    let Keypub = null;
    let storage = new WebStorage(localStorage);
    let keyPrivhex = storage.get("keyPriv");
  
    if (keyPrivhex != null){

        const numArray = keyPrivhex.split(',').map(Number);
        Keypriv = new Uint8Array(numArray)
        Keypub = getPublicKey(Keypriv) // `pk` is a hex string
 
    } 
    return {Keypriv , Keypub }
}