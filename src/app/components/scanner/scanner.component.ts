import { Component, OnDestroy } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { first } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BarcodeFormat } from "@zxing/library";

import {Package, User} from '@/models';

import { AlertService, AuthenticationService } from '@/services';
import { PackageService } from '@/services/package.service';

@Component({ templateUrl: 'scanner.component.html' })
export class ScannerComponent implements OnDestroy {
    private subscription: Subscription;

    public currentUser: User;
    public deviceCurrent: MediaDeviceInfo;
    public deviceSelected: string;

    public formatsEnabled: BarcodeFormat[] = [
        BarcodeFormat.CODE_128,
        BarcodeFormat.DATA_MATRIX,
        BarcodeFormat.EAN_13,
        BarcodeFormat.QR_CODE,
    ];

    constructor(private formBuilder: FormBuilder,
                private modalService: BsModalService,
                private authenticationService: AuthenticationService,
                private alertService: AlertService,
                private packageService: PackageService) {
        this.currentUser = this.authenticationService.currentUserValue;
    }

    public onCodeResult(barcode: string): void {
        console.log(barcode)
        this.subscription = this.packageService.getPackageByBarcode(barcode)
            .pipe(first())
            .subscribe((packageDetails: Package) => {
                this.alertService.primary(`Sequence No: ${packageDetails.seqNo}`);
            });
    }

    public onDeviceChange(device: MediaDeviceInfo) {
        const selectedStr = device?.deviceId || '';
        if (this.deviceSelected === selectedStr) { return; }
        this.deviceSelected = selectedStr;
        this.deviceCurrent = device || undefined;
    }

    public ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
