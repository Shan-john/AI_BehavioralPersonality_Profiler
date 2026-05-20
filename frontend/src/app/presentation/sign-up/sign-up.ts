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
       console.log("enter username and password")
      }else if(this.user.email=== "" ){
        console.log("enter username")
      }else if(this.user.password==""){
         console.log("enter password")
      }else{
      //suscess
      this.sendregister(this.user.email,this.user.password)
    }
  }
 usersignupSummit() {
  console.log(this.user);

  const email = this.user.email?.trim();
  const password = this.user.password?.trim();

  // Email regex (must end with @gmail.com)
  const emailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

  // Password:
  // Minimum 8 characters
  // At least 1 uppercase
  // At least 1 lowercase
  // At least 1 number
  // At least 1 special character
  const passwordPattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  if (email === "" && password === "") {
    console.log("Enter email and password");

  } else if (email === "") {
    console.log("Enter email");

  } else if (!emailPattern.test(email)) {
    console.log("Email must end with @gmail.com");

  } else if (password === "") {
    console.log("Enter password");

  } else if (!passwordPattern.test(password)) {
    console.log(
      "Password must contain 8 characters, uppercase, lowercase, number and special character"
    );

  } else {
    // Success
    this.userLogin(email, password);
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
        localStorage.setItem("loginStatus","true")
        localStorage.setItem("id",res.userId);
        this.router.navigate(['/home']);
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
        localStorage.setItem("loginStatus","true")
        localStorage.setItem("id",res.userId);
        this.router.navigate(['/home']);
      },
      error:(err)=>{
        console.log(err);
        alert(err.error)
      }
    })
  }
   
    

}
