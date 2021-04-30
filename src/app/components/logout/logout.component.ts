import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { IconDefinition } from "@fortawesome/fontawesome-common-types";

@Component({ templateUrl: 'logout.component.html' })
export class LogoutComponent implements OnDestroy {
    public saveClick = new Subject();
    public title: string = '';
    public message: string = '';
    public confirmIcon: IconDefinition = null;

    constructor(public modalRef: BsModalRef) {}

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
