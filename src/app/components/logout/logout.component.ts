import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { BsModalRef } from 'ngx-bootstrap/modal';


import {AlertService, AuthenticationService} from '@/services';

@Component({ templateUrl: 'logout.component.html' })
export class LogoutComponent implements OnDestroy {
    public saveClick = new Subject();
    public title: string = '';
    public message: string = '';
    public confirmIcon: string = '';

    constructor(public modalRef: BsModalRef,
                private authenticationService: AuthenticationService,
                private alertService: AlertService) {}

    public onLogout(): void {
        this.modalRef.hide();
        this.saveClick.next();
    }

    public onCancelClick(): void {
        this.modalRef.hide();
    }

    public ngOnDestroy(): void {
        this.saveClick.complete();
    }
}
