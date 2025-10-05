import axios, {AxiosResponse} from "axios";

const api = axios.create({
    // baseURL: '/api',
    headers: {
        "Content-type" : 'application/json'
    }
})

api.interceptors.request.use(
    (config:any) =>{
        // 요청 시, 헤더에 토큰 세팅
        // if(token){
        //     config.headers.Authorization = token
        // }
        return config;
    },
    (error: any) =>{
        console.error('Request error: ', error)
        return Promise.reject(error);
    }
)

api.interceptors.response.use(
    (response: AxiosResponse) =>{
        return response;
    },
    (error: any) =>{
        const url = error.config?.url || "";

        if(error.response?.status === 401){
            window.location.href = "/";
        }
        console.error('Response Error: ', error)
        return Promise.reject(error);
    }
)

export default api;
