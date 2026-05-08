import{Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
@Injectable({
    providedIn: 'root'
})
export class SplashService {
    
    constructor(private http: HttpClient) { }
    apiurl="http://localhost:5233/api/user/profile/{id}";

    getProfile(id: number) {
        return this.http.get(this.apiurl.replace('{id}', id.toString()));
    }
}