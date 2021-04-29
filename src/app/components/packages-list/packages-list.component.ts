import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { DataTableComponent } from 'ornamentum';
import { faTrash } from "@fortawesome/free-solid-svg-icons/faTrash";
import { faSave } from "@fortawesome/free-solid-svg-icons/faSave";

import { Package, User } from '@/models';

import { AlertService, AuthenticationService } from '@/services';
import { PackageService } from '@/services/package.service';

import { PackageUploadComponent } from '@/components/package-upload';
import { LogoutComponent } from "@/components";

@Component({ templateUrl: 'packages-list.component.html' })
export class PackagesListComponent implements OnInit, OnDestroy {
    public packageForm: FormGroup;
    public currentUser: User;
    public packagesList: Package[];
    public faSave = faSave;
    public faTrash = faTrash

    public loading = false;

    private subscription: Subscription;
    private dataTable: DataTableComponent;

    constructor(private formBuilder: FormBuilder,
                private modalService: BsModalService,
                private authenticationService: AuthenticationService,
                private alertService: AlertService,
                private packageService: PackageService) {
        this.currentUser = this.authenticationService.currentUserValue;
    }

    public ngOnInit(): void {
        this.packageForm = this.formBuilder.group({
            title: ['', Validators.required],
            description: ['', Validators.required]
        });
        this.refreshPackagesList();
    }

    public onDataTableInit(dataTable: DataTableComponent): void {
        this.dataTable = dataTable;
    }

    public openAddNewModal(): void {
        this.loading = true;

        const modalRef: BsModalRef = this.modalService.show(PackageUploadComponent, { ignoreBackdropClick: true });
        modalRef.content.saveClick.subscribe(() => {
            this.refreshPackagesList();
        });
    }

    public openRemoveModal(): void {
        this.loading = true;

        const modalRef: BsModalRef = this.modalService.show(LogoutComponent, { ignoreBackdropClick: true });
        modalRef.content.title = 'Remove Packages';
        modalRef.content.message = 'Are you sure you want to remove all packages data?';
        modalRef.content.confirmIcon = 'fa fa-trash';
        modalRef.content.saveClick.subscribe(() => {
            this.removeAllPackages();
        });
    }

    private removeAllPackages(): void {
        this.subscription = this.packageService.removePackages(this.currentUser.userId)
            .pipe(first())
            .subscribe(() => {
                    this.alertService.primary('Package list removed successful', false);
                    this.refreshPackagesList();
                },
                error => {
                    this.alertService.error(error);
                });
    }

    public refreshPackagesList(): void {
        const emptyValueRepresentation = 'N/A';

        this.subscription = this.packageService.getAllPackages(this.currentUser.userId)
            .pipe(first())
            .subscribe((packages) => {
                this.packagesList = packages.data.map(pkg => {
                    if (pkg.lastScan === '') {
                        pkg.lastScan = emptyValueRepresentation;
                    }

                    if (pkg.seqNo === '') {
                        pkg.seqNo = emptyValueRepresentation;
                    }

                    if (pkg.nameAndAddress === '') {
                        pkg.nameAndAddress = emptyValueRepresentation;
                    }

                    return pkg;
                });
            });
    }

    public ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
