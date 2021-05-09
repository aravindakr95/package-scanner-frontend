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

    private updatePackageStatus(barcode: string): void {
        this.putSubscription = this.packageService.updateScanStatusByBarcode(this.currentUser.userId, barcode).subscribe();
    }

    public onCodeResult(barcode: string): void {
        this.getSubscription = this.packageService.getPackageByBarcode(this.currentUser.userId, barcode)
            .pipe(first())
            .subscribe((response) => {
                let sequenceNo = response.data ? response.data.seqNo : 'N/A';
                let lastScan = response.data ? response.data.lastScan : 'N/A';

                this.alertService
                    .primary(`Barcode ID: ${barcode}, Assignee: ${lastScan}, Sequence No: ${sequenceNo}`);

                if (response.data && response.data.scanStatus === ScanStatus.PENDING) {
                    this.updatePackageStatus(barcode);
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
