import { Component, OnDestroy, OnInit } from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Subject, Subscription} from 'rxjs';
import { IconDefinition } from "@fortawesome/fontawesome-common-types";
import {BsModalRef} from "ngx-bootstrap/modal";
import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons/faExclamationCircle";

import { Package, User } from '@/models';

import {AlertService, AuthenticationService, PackageService} from '@/services';
import {first} from "rxjs/operators";

@Component({templateUrl: 'package-manual-add.component.html'})
export class PackageManualAddComponent implements OnInit, OnDestroy {
    public packageForm: FormGroup;
    public packages: Package[];

    public faSave: IconDefinition = null;
    public faForward: IconDefinition = null;
    public barcodeId: string = '';
    public submitted = false;
    public faExclamationCircle: IconDefinition = faExclamationCircle;

    private currentUser: User;
    private subscription: Subscription;

    public saveClick = new Subject();
    public loading: boolean = false;

    constructor(private formBuilder: FormBuilder,
                private packageService: PackageService,
                private authService: AuthenticationService,
                private alertService: AlertService,
                public modalRef: BsModalRef,
    ) {
        this.currentUser = this.authService.currentUserValue;
    }

    public ngOnInit(): void {
        this.packageForm = this.formBuilder.group({
            address: null,
            routeName: null
        });
    }

    // convenience getter for easy access to form fields
    get f() {
        return this.packageForm.controls;
    }

    public onSubmit(): void {
        this.submitted = true;

        // reset alerts on submit
        this.alertService.clear();

        this.loading = true;
        this.addPackage();
    }

    public addPackage(): void {
        const pkg: Package[] = [
            {
                userId: this.currentUser.userId,
                address: this.f.address.value ? this.f.address.value : 'N/A',
                driver: this.f.routeName.value ? this.f.routeName.value : 'N/A',
                routeDate: new Date().toLocaleDateString(),
                stopNumber: 'N/A',
                orderId: this.barcodeId
            }
        ]

        this.subscription = this.packageService.addPackageCSV(pkg)
            .pipe(first())
            .subscribe(() => {
                    this.modalRef.hide();
                    this.alertService.success(`${this.barcodeId} package added successful`, false);
                    this.loading = false;
                    this.saveClick.next();
                },
                error => this.alertService.error(error));
    }

    public onCancelClick(): void {
        this.modalRef.hide();
    }

    public ngOnDestroy(): void {
    }
}
