import { Routes } from '@angular/router';
import { HomePage } from './pages/home.page';
import { SharedBudgetPage } from './pages/shared-budget.page';

export const routes: Routes = [
	{ path: '', component: HomePage },
	{ path: 'orcamento/:id', component: SharedBudgetPage },
	{ path: '**', redirectTo: '' }
];
