module.exports.user = (user, token=null) =>{
    let transformed_user = {
        "uuid": user.uuid,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "username": user.username,
        "created_at": user.created_at,
        "updated_at": user.updated_at,
    }
    if(token){
        transformed_user.token = token;
    }
    return transformed_user;
}