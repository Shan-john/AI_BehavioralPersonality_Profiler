import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
@Injectable({
  providedIn: 'root'
})
export class AdminHomepageService {
apiurl="http://localhost:5233/api/user/all";

  constructor(private http:HttpClient){}
  getAllUsers(){
    return this.http.get(this.apiurl);
  }

}