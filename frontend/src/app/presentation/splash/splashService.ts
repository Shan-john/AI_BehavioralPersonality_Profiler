import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SplashService {
    apiurl = `${environment.apiUrl}/user/profile/{id}`;

    constructor(private http: HttpClient) {}
    getUser(id: any) {
        return this.http.get(this.apiurl.replace('{id}', id));
    }
}