import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { User } from '@/models';

import { environment } from '@/environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    private static url = `${environment.apiUrl}/v1/api/auth`;

    private currentUserSubject: BehaviorSubject<User>;
    public currentUser: Observable<User>;

    constructor(private http: HttpClient) {
        this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
        this.currentUser = this.currentUserSubject.asObservable();
    }

    public get currentUserValue(): User {
        return this.currentUserSubject.value;
    }

    public registerUser(user: User): Observable<any> {
        return this.http.post<any>(`${AuthenticationService.url}/register`, user);
    }

    public loginUser(email, password): Observable<any> {
        return this.http.post<any>(`${AuthenticationService.url}/login`, { email, password })
            .pipe(map(response => {
                // store user details and jwt token in local storage to keep user logged in between page refreshes
                const user: User = response.data;
                localStorage.setItem('currentUser', JSON.stringify(user));
                this.currentUserSubject.next(user);
                return user;
            }));
    }

    public logoutUser(): void {
        // remove user from local storage and set current user to null
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
    }
}
