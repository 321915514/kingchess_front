import http from '../utils/request'

// 请求首页
export const getData =()=>{
    // 返回promise对象
    return http.get('/home/getData')
}
/*
 Mock.mock('/api/user/add',user.createUser)
Mock.mock('/api/user/update',user.updateUser)
Mock.mock('/api/user/delete',user.deleteUser)
Mock.mock('/api/user/findAll',user.getUserList) 
 */
export const add =(data)=>{
    return http.post('/user/add',data)
}
export const update =(data)=>{
    return http.post('/user/update',data)
}
export const del = (data)=>{
    return http.post('/user/delete', data)
}
export const findAll =(params)=>{
    return http.get('user/findAll',params)
}
export const login =(data)=>{
    // console.log(data);
return http.post('http://117.72.75.113/api/user/login',data)
    // return http.post('http://10.151.37.243:5000/user/login', data)
}
export const logout =(data)=>{
    // console.log(data);
return http.post('http://117.72.75.113/api/user/logout',data)
    // return http.post('http://10.151.37.243:5000/user/logout', data)
}
export const register =(data)=>{
    // console.log(data);
    return http.post('http://117.72.75.113/api/user/register',data)
    // return http.post('http://10.151.37.243:5000/user/register', data)
}
// export const beginGame =(data)=>{
//     // console.log(data);
//     return http.post('http://117.72.75.113/api/new_game/random',data)
// }
// export const selectMove = (data)=>{
//     return http.post('http://117.72.75.113/api/select-move/mcts',data)
// }

export const get_sgf_data = (data)=>{
    // return http.post('http://10.151.37.243:5000/common/get_all_sgf', data)
    return http.post('http://117.72.75.113/api/common/get_all_sgf', data)
}

export const get_sgf_by_user = (data)=>{
    // return http.post('http://10.151.37.243:5000/common/get_sgf_by_user', data)
    return http.post('http://117.72.75.113/api/common/get_sgf_by_user', data)
}



export const get_win_data = (data)=>{
    // return http.post('http://10.151.37.243:5000/common/get_win_rate', data)
    return http.post('http://117.72.75.113/api/common/get_win_rate', data)
}

export const userLogin = (data)=>{
    // return http.post('http://10.151.37.243:5000/user/get_ttl_user', data)
    return http.post('http://117.72.75.113/api/user/get_ttl_user', data)
}
