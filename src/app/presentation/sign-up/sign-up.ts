import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserModel } from '../../model/userModel';
import { Imagelogo } from "../../assests/logo";
import { register } from './sign-up-service';
@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './sign-up.html',
})
export class SignUp {
logo: string = Imagelogo;
user: UserModel = new UserModel();  
indentifylogin:boolean = false;
      constructor(private register: register,private router: Router ) {};
     
  showPassword:boolean = false;
   showloading:boolean = false;
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  setlogin(){  
    this.indentifylogin = true;
  }
  setregister(){
    this.indentifylogin = false;
  }
  
  userloginSummit(){
     console.log(this.user);
     
      if(this.user.email=== ""&& this.user.password === ""){
       console.log("enter usernmae and password")
      }else if(this.user.email=== "" ){
        console.log("enter username")
      }else if(this.user.password==""){
         console.log("enter password")
      }else{
      //suscess
      this.sendregister(this.user.email,this.user.password)
    }
  }
  usersignupSummit(){
     console.log(this.user);
     
      if(this.user.email=== ""&& this.user.password === ""){
       console.log("enter usernmae and password")
      }else if(this.user.email=== "" ){
        console.log("enter username")
      }else if(this.user.password==""){
         console.log("enter password")
      }else{
      //suscess
      this.userLogin(this.user.email,this.user.password)
    }
  }
usersummit  (){
  if(!this.indentifylogin){
    this.showloading = true;  
    this.userloginSummit();
    this.showloading = false;
  }else{
    this.showloading = true;
    this.usersignupSummit();
    this.showloading = false;
  }

}
  

  sendregister(email:string,password:string){
    this.register.userRegister(email,password).subscribe({
      next:(res:any)=>{
        console.log(res);
        this.router.navigate(['/home']);
        localStorage.setItem("loginStatus","true")
      },
      error:(err)=>{
        console.log(err);
        alert(err.error)
      }
    })
  }
  userLogin(email:string,password:string){
    this.register.userLogin(email,password).subscribe({
      next:(res:any)=>{
        console.log(res);
        this.router.navigate(['/home']);
        localStorage.setItem("loginStatus","true")
        localStorage.setItem("id",res.id);
      },
      error:(err)=>{
        console.log(err);
        alert(err.error)
      }
    })
  }
   
    

}
