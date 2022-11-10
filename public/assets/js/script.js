function addtocart(proId){
    $.ajax({
        url:'/addtocart/'+proId,
        method:'get',
        success:(response)=>{
           
        }
    })
}