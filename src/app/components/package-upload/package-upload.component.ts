import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { camelCase } from 'lodash/string';

import { Package } from '@/models';

import { AlertService, PackageService } from '@/services';

@Component({ templateUrl: 'package-upload.component.html' })
export class PackageUploadComponent implements OnInit, OnDestroy {
    public packageForm: FormGroup;
    public packages: Package[];

    private subscription: Subscription;
    private isFileLoaded: boolean = false;

    public saveClick = new Subject();
    public submitted = false;

    constructor(private formBuilder: FormBuilder,
                public modalRef: BsModalRef,
                private packageService: PackageService,
                private alertService: AlertService
    ) {
    }

    public ngOnInit(): void {
        this.packageForm = this.formBuilder.group({
            csvFile: [null, Validators.required]
        });
    }

    private static removeDuplicatedQuotes(field) {
        return field.replace(/['"]+/g, '')
    }

    public textToArray(textFields): void {
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

        this.packages = result;
    }

    public csvToText(file): void {
        const reader = new FileReader();
        reader.readAsText(file.files[0]);
        reader.onload = () => {
            this.textToArray(reader.result);
            this.isFileLoaded = true;
        }
    }

    public onSubmit(file): void {
        this.submitted = true;
        // stop here if form is invalid
        if (this.packageForm.invalid) {
            return;
        }

        this.csvToText(file);

        if (!this.isFileLoaded) {
            return;
        }

        this.subscription = this.packageService.addPackageCSV(this.packages)
            .pipe(first())
            .subscribe(() => {
                    this.modalRef.hide();
                    this.alertService.success('Package list added successful', false);
                    this.saveClick.next();
                },
                error => {
                    this.alertService.error(error);
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
