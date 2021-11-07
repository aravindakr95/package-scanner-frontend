import { Component, OnInit, OnDestroy } from '@angular/core';
import { first } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { parse } from 'json2csv';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { faTrash } from "@fortawesome/free-solid-svg-icons/faTrash";
import { faFileImport } from "@fortawesome/free-solid-svg-icons/faFileImport";
import { faFileExport } from "@fortawesome/free-solid-svg-icons/faFileExport";
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
    public packagesList: Package[] = [];
    public selectedRows: any[] = [];
    public faFileImport: IconDefinition = faFileImport;
    public faFileExport: IconDefinition = faFileExport;
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

    public openImportNewModal(): void {
        this.loading = true;

        const modalRef: BsModalRef = this.modalService.show(PackageUploadComponent,
            {ignoreBackdropClick: true});
        modalRef.content.faSave = this.faFileImport;
        modalRef.content.saveClick.subscribe(() => this.refreshPackagesList());
    }

    public openExportModal(): void {
        this.loading = true;
        this.refreshPackagesList();
        const fields = [ 'orderId', 'driver', 'stopNumber', 'scanStatus', 'address' ];
        const opts = { fields };
        try {
            const csv = parse(this.packagesList, opts);

            const anchorTag = document.createElement('a');
            const blob = new Blob([csv], {type: 'text/csv'});
            const url = window.URL.createObjectURL(blob);

            anchorTag.href = url;
            anchorTag.download =
                `${new Date().toLocaleDateString()}_sorted_list.csv`;
            anchorTag.click();
            window.URL.revokeObjectURL(url);
            anchorTag.remove();
        } catch (error) {
            console.log(error);
        }
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
        const packagesSize = this.packagesList.length;
        this.subscription = this.packageService.removePackages(this.currentUser.userId)
            .pipe(first())
            .subscribe(() => {
                    this.alertService.primary(`${packagesSize} Packages removed successful`, false);
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
