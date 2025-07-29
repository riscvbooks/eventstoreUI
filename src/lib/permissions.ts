export function getPerm(permissions,pubkey){

    return permissions.find(item => item.pubkey === pubkey)?.permissions || '无';
}