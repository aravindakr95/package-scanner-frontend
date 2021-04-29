import { Component, OnDestroy } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { first } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BarcodeFormat } from "@zxing/library";
// import { faLightbulb } from '@fortawesome/free-solid-svg-icons';

import { User } from '@/models';

import { AlertService, AuthenticationService, PackageService } from '@/services';

@Component({ templateUrl: 'barcode-scanner.component.html' })
export class BarcodeScannerComponent implements OnDestroy {
    private subscription: Subscription;
    private message: string;

    // public faLightbulb = faLightbulb;
    // public torchStatus: string = '0';
    // public isTorchEnabled: boolean = false;
    public currentUser: User;
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
        this.subscription = this.packageService.getPackageByBarcode(this.currentUser.userId, barcode)
            .pipe(first())
            .subscribe((response) => {
                const sequenceNo = response.data ? response.data.seqNo : 'N/A';

                this.message = `Barcode ID: ${barcode}, Sequence No: ${sequenceNo}`;
                this.alertService.primary(this.message);
            });
    }

    // public toggleTorch(): void {
    //     this.isTorchEnabled = !this.isTorchEnabled;
    // }

    public ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
