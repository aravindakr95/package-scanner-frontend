import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { DataTableModule } from 'ornamentum';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ButtonsModule } from "ngx-bootstrap/buttons";
import { ZXingScannerModule } from "@zxing/ngx-scanner";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";

import { AppComponent } from './app.component';

import { appRoutingModule } from './app.routing';

import {
    RegisterComponent,
    LoginComponent,
    LogoutComponent,
    PackagesListComponent,
    BarcodeScannerComponent,
    PackageUploadComponent,
    AlertComponent
} from '@/components';

import { ErrorInterceptor, JwtInterceptor } from '@/helpers';

@NgModule({
    imports: [
        BrowserModule,
        ReactiveFormsModule,
        HttpClientModule,
        FormsModule,
        ModalModule.forRoot(),
        ButtonsModule.forRoot(),
        DataTableModule.forRoot(),
        FontAwesomeModule,
        ZXingScannerModule,
        appRoutingModule
    ],
    declarations: [
        AppComponent,
        RegisterComponent,
        LoginComponent,
        LogoutComponent,
        PackagesListComponent,
        BarcodeScannerComponent,
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
