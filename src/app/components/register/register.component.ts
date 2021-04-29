import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { faUserPlus } from "@fortawesome/free-solid-svg-icons/faUserPlus";

import { AlertService, AuthenticationService } from '@/services';

@Component({ templateUrl: 'register.component.html' })
export class RegisterComponent implements OnInit {
    public registerForm: FormGroup;
    public faUserPlus = faUserPlus;
    public loading = false;
    public submitted = false;

    constructor(
        private formBuilder: FormBuilder,
        private router: Router,
        private authenticationService: AuthenticationService,
        private alertService: AlertService
    ) {
        // redirect to packages-list if already logged in
        if (this.authenticationService.currentUserValue) {
            this.router.navigate(['/']);
        }
    }

    public ngOnInit(): void {
        this.registerForm = this.formBuilder.group({
            fullName: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(8)]]
        });
    }

    // convenience getter for easy access to form fields
    public get f() { return this.registerForm.controls; }

    public onSubmit(): void {
        this.submitted = true;

        // reset alerts on submit
        this.alertService.clear();

        // stop here if form is invalid
        if (this.registerForm.invalid) {
            return;
        }

        this.loading = true;
        this.authenticationService.registerUser(this.registerForm.value)
            .pipe(first())
            .subscribe(
                data => {
                    this.alertService.success('Registration successful', true);
                    this.router.navigate(['/login']);
                },
                error => {
                    this.alertService.error(error);
                    this.loading = false;
                });
    }
}
