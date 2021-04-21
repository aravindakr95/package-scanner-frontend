import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Package } from '@/models';

import { environment } from '@/environments/environment';

@Injectable({ providedIn: 'root' })
export class PackageService {
    private static package_url = `${environment.apiUrl}/v1/api/packages`;

    constructor(private http: HttpClient) {}

    public addPackageCSV(packages: Package[]): Observable<any> {
        return this.http.post(`${PackageService.package_url}/upload`, packages);
    }

    public getPackageByBarcode(barcode): Observable<any> {
        const params = { barcode };
        return this.http.get(`${PackageService.package_url}`, { params });
    }

    public getAllPackages(): Observable<any> {
        return this.http.get(PackageService.package_url);
    }

    public removePackages(): Observable<any> {
        return this.http.delete(`${PackageService.package_url}/delete`);
    }
}
