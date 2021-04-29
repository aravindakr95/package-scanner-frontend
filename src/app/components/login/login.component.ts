import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { faSignInAlt } from "@fortawesome/free-solid-svg-icons/faSignInAlt";

import { AlertService, AuthenticationService } from '@/services';

@Component({ templateUrl: 'login.component.html' })
export class LoginComponent implements OnInit {
    public loginForm: FormGroup;
    public returnUrl: string;

    public faSignInAlt = faSignInAlt;
    public loading = false;
    public submitted = false;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private authenticationService: AuthenticationService,
        private alertService: AlertService
    ) {
        // redirect to packages-list if already logged in
        if (this.authenticationService.currentUserValue) {
            this.navigate('/');
        }
    }

    public ngOnInit(): void {
        this.loginForm = this.formBuilder.group({
            email: ['', Validators.required],
            password: ['', Validators.required]
        });

        // get return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    }

    // convenience getter for easy access to form fields
    get f() {
        return this.loginForm.controls;
    }

    public navigate(route) {
        this.router.navigate([route]);
    }

    public onSubmit(): void {
        this.submitted = true;

        // reset alerts on submit
        this.alertService.clear();

        // stop here if form is invalid
        if (this.loginForm.invalid) {
            return;
        }

        this.loading = true;
        this.authenticationService.loginUser(this.f.email.value, this.f.password.value)
            .pipe(first())
            .subscribe(() => {
                this.navigate(this.returnUrl);
            }, (error) => {
                this.alertService.error(error);
                this.loading = false;
            });
    }
}
