import { Component, OnDestroy } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { first } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BarcodeFormat } from "@zxing/library";

import { User } from '@/models';

import { ScanStatus } from "@/enums";

import { AlertService, AuthenticationService, PackageService } from '@/services';

@Component({ templateUrl: 'barcode-scanner.component.html' })
export class BarcodeScannerComponent implements OnDestroy {
    private getSubscription: Subscription;
    private putSubscription: Subscription;

    public currentUser: User;
    public formatsEnabled: BarcodeFormat[] = [
        BarcodeFormat.CODE_128,
        BarcodeFormat.DATA_MATRIX,
        BarcodeFormat.EAN_13
    ];

    constructor(private formBuilder: FormBuilder,
                private modalService: BsModalService,
                private authenticationService: AuthenticationService,
                private alertService: AlertService,
                private packageService: PackageService) {
        this.currentUser = this.authenticationService.currentUserValue;
    }

    private updatePackageStatus(orderId: string): void {
        this.putSubscription = this.packageService.updateScanStatusByBarcode(this.currentUser.userId, orderId).subscribe();
    }

    public onCodeResult(orderId: string): void {
        this.getSubscription = this.packageService.getPackageByBarcode(this.currentUser.userId, orderId)
            .pipe(first())
            .subscribe((response) => {
                let stopNo = response.data ? response.data.stopNumber : 'N/A';
                let driver = response.data ? response.data.driver : 'N/A';

                this.alertService
                    .primary(`Order ID: ${orderId}, Driver: ${driver}, Stop No: ${stopNo}`);

                if (response.data && response.data.scanStatus === ScanStatus.PENDING) {
                    this.updatePackageStatus(orderId);
                }
            });
    }

    public ngOnDestroy(): void {
        if (this.getSubscription) {
            this.getSubscription.unsubscribe();
        }

        if (this.putSubscription) {
            this.putSubscription.unsubscribe();
        }
    }
}
