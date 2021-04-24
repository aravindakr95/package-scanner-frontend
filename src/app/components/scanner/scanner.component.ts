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
    public availableDevices: MediaDeviceInfo[];
    public deviceCurrent: MediaDeviceInfo;
    public deviceSelected: string;
    public hasPermission: boolean;
    public hasDevices: boolean;

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
        this.subscription = this.packageService.getPackageByBarcode(barcode)
            .pipe(first())
            .subscribe((packageDetails: Package) => {
                const sequenceNo = packageDetails.seqNo === undefined ? barcode + 'not found' :
                    'Sequence No: ' + packageDetails.seqNo;
                this.alertService.primary(sequenceNo);
            });
    }K

    public onCamerasFound(devices: MediaDeviceInfo[]): void {
        this.availableDevices = devices;
        this.hasDevices = Boolean(devices && devices.length);
    }

    public onHasPermission(has: boolean) {
        this.hasPermission = has;
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
