import { Routes, RouterModule } from '@angular/router';

import {
    RegisterComponent,
    LoginComponent,
    PackagesListComponent,
    BarcodeScannerComponent
} from '@/components';

import { AuthGuard } from '@/helpers';

const routes: Routes = [
    { path: '', component: PackagesListComponent, pathMatch: 'full', canActivate: [AuthGuard] },
    { path: 'scanner', component: BarcodeScannerComponent, canActivate: [AuthGuard] },
    { path: 'register', component: RegisterComponent },
    { path: 'login', component: LoginComponent },

    // otherwise redirect to packages-list
    { path: '**', redirectTo: '' }
];

export const appRoutingModule = RouterModule.forRoot(routes);
