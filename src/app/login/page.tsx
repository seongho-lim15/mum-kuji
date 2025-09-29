"use client"

import LoginForm from "@/components/LoginForm";

const Login = () =>{
    return (
        <LoginForm onLoginSuccess={()=>console.log('login')}/>
    )
}

export default Login;