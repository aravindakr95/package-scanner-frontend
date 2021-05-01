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

    public getPackageByBarcode(userId: string, barcode: string): Observable<any> {
        const params = { barcode };
        return this.http.get(`${PackageService.package_url}/${userId}`, { params });
    }

    public getAllPackages(userId: string): Observable<any> {
        return this.http.get(`${PackageService.package_url}/${userId}`);
    }

    public updatePackageScanStatus(userId: string, barcode: string, isScanned = true): Observable<any> {
        const params = { barcode };
        return this.http.put(`${PackageService.package_url}/${userId}`, { isScanned }, { params })
    }

    public removePackages(userId: string): Observable<any> {
        return this.http.delete(`${PackageService.package_url}/${userId}/delete`);
    }
}
