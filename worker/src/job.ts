export default {
    key:'queue',
    handle(data){
        const {uf, city} = data.data
        console.log(uf, city)
    }
}