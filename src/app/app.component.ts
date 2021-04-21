import {Component} from '@angular/core';
import {Router} from '@angular/router';

import {AlertService, AuthenticationService} from './services';
import {User} from './models';

import './content/app.less';
import {BsModalRef, BsModalService} from "ngx-bootstrap/modal";
import {PackageUploadComponent} from "@/components";
import {LogoutComponent} from "@/components/logout/logout.component";

@Component({selector: 'app-root', templateUrl: 'app.component.html'})
export class AppComponent {
    public currentUser: User;
    public loading: boolean = false;

    constructor(private router: Router,
                private authenticationService: AuthenticationService,
                private modalService: BsModalService) {
        this.authenticationService.currentUser.subscribe(data => this.currentUser = data);
    }

    public navigate(route): void {
        this.router.navigate([route]);
    }

    public openLogoutModal(): void {
        this.loading = true;

        const modalRef: BsModalRef = this.modalService.show(LogoutComponent, {ignoreBackdropClick: true});
        modalRef.content.title = 'Logout Account';
        modalRef.content.message = 'Are you sure you want to Logout?';
        modalRef.content.confirmIcon = 'fa fa-power-off';
        modalRef.content.saveClick.subscribe(() => {
            this.authenticationService.logoutUser();
            this.navigate('/login');
        });
    }
}
