import * as XLSX from 'xlsx';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject, Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { camelCase } from 'lodash/string';
import { mapKeys } from 'lodash/mapKeys';
import { IconDefinition } from "@fortawesome/fontawesome-common-types";

import { Package, User } from '@/models';

import { AlertService, AuthenticationService, PackageService } from '@/services';

@Component({templateUrl: 'package-upload.component.html'})
export class PackageUploadComponent implements OnInit, OnDestroy {
    public packageForm: FormGroup;
    public packages: Package[];

    public faSave: IconDefinition = null;

    private currentUser: User;
    private subscription: Subscription;

    public saveClick = new Subject();
    public loading: boolean = false;

    private worksheet: any;
    private storeData: any;
    private fileUploaded: File;

    constructor(private formBuilder: FormBuilder,
                private packageService: PackageService,
                private authService: AuthenticationService,
                private alertService: AlertService,
                public modalRef: BsModalRef,
    ) {
        this.currentUser = this.authService.currentUserValue;
    }

    private addPackages(): void {
        const emptyValueRepresentation = 'N/A';
        this.packages = this.packages.map((pkg: Package) => {
            const convertedObj = mapKeys(pkg, (v, k) => camelCase(k));
            convertedObj.userId= this.currentUser.userId;

            if (convertedObj.orderId === '') {
                convertedObj.orderId = emptyValueRepresentation;
            }

            if (convertedObj.driver === '') {
                convertedObj.driver = emptyValueRepresentation;
            }

            if (convertedObj.stopNumber === '') {
                convertedObj.stopNumber = emptyValueRepresentation;
            }

            if (convertedObj.address === '') {
                convertedObj.address = emptyValueRepresentation;
            }

            if (convertedObj.routeDate === '') {
                convertedObj.routeDate = emptyValueRepresentation;
            }

            return convertedObj;
        });

        this.subscription = this.packageService.addPackageCSV(this.packages)
            .pipe(first())
            .subscribe(() => {
                    this.modalRef.hide();
                    this.alertService.success(`${this.packages.length} packages added successful`, false);
                    this.loading = false;
                    this.saveClick.next();
                },
                error => this.alertService.error(error));
    }

    public ngOnInit(): void {
        this.packageForm = this.formBuilder.group({
            xlsFile: [null, Validators.required]
        });
    }

    private readAsJson(): any {
        return XLSX.utils.sheet_to_json(this.worksheet, {raw: false});
    }

    private readExcel(file): Observable<any> {
        let readFile = new FileReader();
        const ob = new Observable<boolean>(obs => {
            readFile.onload = () => {
                this.storeData = readFile.result;
                const data = new Uint8Array(this.storeData);
                const arr = [];
                for (let i = 0; i != data.length; i += 1) arr[i] = String.fromCharCode(data[i]);
                const bstr = arr.join("");
                const workbook = XLSX.read(bstr, {type: 'binary'});
                const firstSheetName = workbook.SheetNames[0];

                this.worksheet = workbook.Sheets[firstSheetName];
                this.packages = this.readAsJson();

                obs.next(true);
                obs.complete();
            }
        });

        readFile.readAsArrayBuffer(file);
        return ob;
    }

    public onLoad(event): void {
        this.loading = true;

        this.fileUploaded = event.target.files[0];

        this.readExcel(event.target.files[0]).subscribe(status => {
            if (status) {
                this.loading = false;
            }
        });
    }

    public onSubmit(): void {
        if (this.packageForm.invalid) {
            return;
        }

        this.loading = true;
        this.addPackages();
        this.loading = false;
    }

    public onCancelClick(): void {
        this.modalRef.hide();
    }

    public ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
        this.saveClick.complete();
    }
}
