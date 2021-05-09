import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { faPowerOff } from "@fortawesome/free-solid-svg-icons/faPowerOff";
import { faUserCircle } from "@fortawesome/free-solid-svg-icons/faUserCircle";
import { faArchive } from "@fortawesome/free-solid-svg-icons/faArchive";
import { faQrcode } from "@fortawesome/free-solid-svg-icons/faQrcode";

import { version } from '../../package.json';

import { AuthenticationService } from './services';

import { User } from './models';

import { LogoutComponent } from "@/components";

import './content/app.less';

@Component({selector: 'app-root', templateUrl: 'app.component.html'})
export class AppComponent {
    public currentUser: User;
    public loading: boolean = false;
    public version: string = version;
    public faPowerOff = faPowerOff;
    public faUserCircle = faUserCircle;
    public faArchive = faArchive;
    public faQrcode = faQrcode;

    constructor(private router: Router,
                private authenticationService: AuthenticationService,
                private modalService: BsModalService) {
        this.authenticationService.currentUser.subscribe(data => this.currentUser = data);
    }

    public navigate(route): void {
        this.router.navigate([route]);
    }

    public isActiveRoute(url: string): boolean {
        return this.router.url === url;
    }

    public openLogoutModal(): void {
        this.loading = true;

        const modalRef: BsModalRef = this.modalService.show(LogoutComponent, {ignoreBackdropClick: true});
        modalRef.content.title = 'Logout Account';
        modalRef.content.message = 'Are you sure you want to Logout?';
        modalRef.content.confirmIcon = this.faPowerOff;
        modalRef.content.saveClick.subscribe(() => {
            this.authenticationService.logoutUser();
            this.navigate('/login');
        });
    }
}
