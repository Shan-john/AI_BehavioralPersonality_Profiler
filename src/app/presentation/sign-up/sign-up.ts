import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserModel } from '../../model/userModel';
import { Imagelogo } from "../../assests/logo";

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './sign-up.html',
})
export class SignUp {
logo: string = Imagelogo;
user: UserModel = new UserModel();  
   confirmpassword :string =""
    constructor(private router: Router) {}
  showPassword:boolean = false;
  showConfirmPassword:boolean = false;
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
  userLoginSummit(){
     console.log(this.user),
     console.log(this.confirmpassword)
      if(this.user.email=== ""&& this.user.password === ""){
       console.log("enter usernmae and password")
      }else if(this.user.email=== "" ){
        console.log("enter username")
      }else if(this.user.password==""){
         console.log("enter password")
      }else{
          if(this.user.password === this.confirmpassword){
        console.log("successfully logined")
         this.router.navigate(['/home'])
         console.log("routing")
      } else{
        console.log("check pasword")
      }
    }
  }
   
    

}
