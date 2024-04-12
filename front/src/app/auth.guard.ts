import { CanActivateFn } from "@angular/router";

export const SinCuenta: CanActivateFn = () =>{
    const token = localStorage.getItem('token');
    
    if (!token){
        return true;
    } else {
        window.location.href = "";
        return false;
    }
}

export const ConCuenta: CanActivateFn = () =>{
    const token = localStorage.getItem('token');
    
    if (token){
        return true;
    } else {
        window.location.href = "";
        return false;
    }
}