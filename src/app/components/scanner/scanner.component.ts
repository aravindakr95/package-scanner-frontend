import { Component, OnDestroy } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { first } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BarcodeFormat } from "@zxing/library";

import { User } from '@/models';

import {AudioLayout} from "@/enums";

import { AlertService, AuthenticationService, PackageService } from '@/services';

@Component({ templateUrl: 'scanner.component.html' })
export class ScannerComponent implements OnDestroy {
    private subscription: Subscription;
    private message: string;

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
                const beep = new Audio(AudioLayout.BEEP);

                this.message = `Barcode ID: ${barcode}, Sequence No: ${sequenceNo}`;

                beep.play();

                this.alertService.primary(this.message);
            });
    }

    public ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
