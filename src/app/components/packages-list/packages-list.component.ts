import { Component, OnInit, OnDestroy } from '@angular/core';
import { first } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { faTrash } from "@fortawesome/free-solid-svg-icons/faTrash";
import { faSave } from "@fortawesome/free-solid-svg-icons/faSave";
import { faCheck } from "@fortawesome/free-solid-svg-icons/faCheck";
import { faExclamation } from "@fortawesome/free-solid-svg-icons/faExclamation";
import { faUser } from "@fortawesome/free-solid-svg-icons/faUser";
import { IconDefinition } from "@fortawesome/fontawesome-common-types";

import { Package, User } from '@/models';

import { ScanStatus } from "@/enums";

import { AlertService, AuthenticationService, PackageService } from '@/services';

import { LogoutComponent, PackageUploadComponent } from "@/components";

@Component({templateUrl: 'packages-list.component.html'})
export class PackagesListComponent implements OnInit, OnDestroy {
    public currentUser: User;
    public packagesList: Package[];
    public selectedRows: any[] = [];
    public faSave: IconDefinition = faSave;
    public faTrash: IconDefinition = faTrash
    public faCheck: IconDefinition = faCheck;
    public faExclamation: IconDefinition = faExclamation;
    public faUser: IconDefinition = faUser;
    public loading: boolean = false;

    public ScanStatus = ScanStatus;

    private subscription: Subscription;

    constructor(private modalService: BsModalService,
                private authenticationService: AuthenticationService,
                private alertService: AlertService,
                private packageService: PackageService) {
        this.currentUser = this.authenticationService.currentUserValue;
    }

    private updateSelectedRows(): void {
        this.packagesList.filter((pkg: Package) => {
            if (pkg.scanStatus === ScanStatus.COMPLETE) {
                this.selectedRows.push(pkg._id);
            }
        });
    }

    private refreshPackagesList(): void {
        this.subscription = this.packageService.getAllPackages(this.currentUser.userId)
            .pipe(first()).subscribe((packages) => {
                this.packagesList = packages.data;
                this.updateSelectedRows();
            });
    }

    private updatePackageStatus(packageId: string): void {
        this.subscription = this.packageService.updateScanStatusById(this.currentUser.userId, packageId)
            .subscribe(() => this.refreshPackagesList());
    }

    public ngOnInit(): void {
        this.refreshPackagesList();
    }

    public openAddNewModal(): void {
        this.loading = true;

        const modalRef: BsModalRef = this.modalService.show(PackageUploadComponent,
            {ignoreBackdropClick: true});
        modalRef.content.faSave = this.faSave;
        modalRef.content.saveClick.subscribe(() => this.refreshPackagesList());
    }

    public openRemoveModal(): void {
        this.loading = true;

        const modalRef: BsModalRef = this.modalService.show(LogoutComponent, {ignoreBackdropClick: true});
        modalRef.content.title = 'Remove Packages';
        modalRef.content.message = 'Are you sure you want to remove the all packages on list?';
        modalRef.content.confirmIcon = this.faTrash;
        modalRef.content.saveClick.subscribe(() => this.removeAllPackages());
    }

    private removeAllPackages(): void {
        this.subscription = this.packageService.removePackages(this.currentUser.userId)
            .pipe(first())
            .subscribe(() => {
                    this.alertService.primary('Package list removed successful', false);
                    this.refreshPackagesList();
                }, error => this.alertService.error(error));
    }

    public onRowSelectChange(pkgIds: string[]): void {
        if (!this.packagesList || !this.packagesList.length) {
            return;
        }

        if (pkgIds && pkgIds.length) {
            const packageId = pkgIds[pkgIds.length - 1];
            this.updatePackageStatus(packageId);
        }
    }

    public ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
