import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subscription} from 'rxjs';
import { first } from "rxjs/operators";
import { IconDefinition } from "@fortawesome/fontawesome-common-types";
import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons/faExclamationCircle";
import { BsModalRef } from "ngx-bootstrap/modal";

import { Package, User } from '@/models';

import {AlertService, AuthenticationService, PackageService} from '@/services';

import { ScanStatus } from "@/enums";

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
    get getFormControls() {
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
                address: this.getFormControls.address.value
                    ? this.getFormControls.address.value : 'N/A',
                driver: this.getFormControls.routeName.value
                    ? this.getFormControls.routeName.value : 'N/A',
                routeDate: new Date().toLocaleDateString(),
                stopNumber: 'N/A',
                orderId: this.barcodeId,
                scanStatus: ScanStatus.COMPLETE
            }
        ]

        this.subscription = this.packageService.addPackageCSV(pkg)
            .pipe(first())
            .subscribe(() => {
                    this.modalRef.hide();
                    this.alertService.success(`${this.barcodeId} package added successful`, false);
                    this.loading = false;
                },
                error => this.alertService.error(error));
    }

    public onCancelClick(): void {
        this.modalRef.hide();
    }

    public ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
