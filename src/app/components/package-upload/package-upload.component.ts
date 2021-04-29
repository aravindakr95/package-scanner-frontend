import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject, Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { camelCase } from 'lodash/string';
import { faUpload } from "@fortawesome/free-solid-svg-icons/faUpload";

import { Package, User } from '@/models';

import { AlertService, AuthenticationService, PackageService } from '@/services';

@Component({ templateUrl: 'package-upload.component.html' })
export class PackageUploadComponent implements OnInit, OnDestroy {
    public packageForm: FormGroup;
    public packages: Package[];
    public faUpload = faUpload;

    private currentUser: User;
    private subscription: Subscription;

    public saveClick = new Subject();
    public loading: boolean = false;
    public isFileLoaded: boolean = false;

    constructor(private formBuilder: FormBuilder,
                private packageService: PackageService,
                private authService: AuthenticationService,
                private alertService: AlertService,
                public modalRef: BsModalRef,
    ) {
        this.currentUser = this.authService.currentUserValue;
    }

    private static removeDuplicatedQuotes(field) {
        return field.replace(/['"]+/g, '')
    }

    private textToArray(textFields): void {
        let lines = textFields.split('\n');
        let headers = lines[0].split(',');

        const result: Package[] = [];

        for (let i = 1; i < lines.length - 1; i++) {
            let obj: Package = {} as Package;
            let currentLine = lines[i].split(',');

            for (let j = 0; j < headers.length; j++) {
                const header = camelCase(headers[j]);
                obj[header] = PackageUploadComponent.removeDuplicatedQuotes(currentLine[j]);
            }

            result.push(obj);
        }

        this.packages = result.map(pkg => {
            pkg['userId'] = this.currentUser.userId;
            return pkg;
        });
    }

    private csvToText(file): Observable<boolean> {
        return new Observable<boolean>(obs => {
           const reader = new FileReader();
            reader.readAsText(file.files[0]);
            reader.onload = () => {
                this.textToArray(reader.result);

                obs.next(true);
                obs.complete();
            }
        });
    }

    private addPackages(): void {
        this.subscription = this.packageService.addPackageCSV(this.packages)
            .pipe(first())
            .subscribe(() => {
                    this.modalRef.hide();
                    this.alertService.success(`${this.packages.length} packages added successful`, false);
                    this.loading = false;
                    this.saveClick.next();
                },
                error => {
                    this.alertService.error(error);
                });
    }

    public ngOnInit(): void {
        this.packageForm = this.formBuilder.group({
            csvFile: [null, Validators.required]
        });
    }

    public onSubmit(file): void {
        // stop here if form is invalid
        if (this.packageForm.invalid) {
            return;
        }

        this.loading = true;

        this.csvToText(file).subscribe(status => {
            if (status) {
                this.addPackages()
            }
        });

        this.isFileLoaded = false;
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
