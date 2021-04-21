import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { DataTableModule } from 'ornamentum';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ZXingScannerModule } from "@zxing/ngx-scanner";

import { AppComponent } from './app.component';

import { appRoutingModule } from './app.routing';

import {
    RegisterComponent,
    LoginComponent,
    LogoutComponent,
    PackagesListComponent,
    ScannerComponent,
    PackageUploadComponent,
    AlertComponent
} from '@/components';

import { ErrorInterceptor, JwtInterceptor } from '@/helpers';

@NgModule({
    imports: [
        BrowserModule,
        ReactiveFormsModule,
        HttpClientModule,
        ModalModule.forRoot(),
        DataTableModule.forRoot(),
        ZXingScannerModule,
        appRoutingModule
    ],
    declarations: [
        AppComponent,
        RegisterComponent,
        LoginComponent,
        LogoutComponent,
        PackagesListComponent,
        ScannerComponent,
        PackageUploadComponent,
        AlertComponent,
    ],
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    ],
    entryComponents: [
        PackageUploadComponent,
        LogoutComponent
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
