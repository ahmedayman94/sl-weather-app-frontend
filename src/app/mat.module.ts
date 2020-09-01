import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatCardModule } from "@angular/material/card"
import { MatDividerModule } from "@angular/material/divider";
import { CdkTableModule } from '@angular/cdk/table';
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatButtonModule } from "@angular/material/button";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatNativeDateModule } from "@angular/material/core";
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

// import {
//     MatCheckboxModule,
//     MatChipsModule,
//     MatDatepickerModule,
//     MatDialogModule,
//     MatExpansionModule,
//     MatGridListModule,
//     MatIconModule,
//     MatInputModule,
//     MatListModule,
//     MatMenuModule,
//     MatPaginatorModule,
//     MatProgressBarModule,
//     MatProgressSpinnerModule,
//     MatRadioModule,
//     MatRippleModule,
//     MatSelectModule,
//     MatSidenavModule,
//     MatSliderModule,
//     MatSlideToggleModule,
//     MatSnackBarModule,
//     MatSortModule,
//     MatStepperModule,
//     MatTableModule,
//     MatTabsModule,
//     MatToolbarModule,
//     MatTooltipModule,
//   } from '@angular/material';


import { NgModule } from '@angular/core';

@NgModule({
    exports: [
        MatCardModule,
        MatDividerModule,
        BrowserAnimationsModule,
        CdkTableModule,
        MatAutocompleteModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatNativeDateModule,
        MatListModule,
        MatIconModule
    ]
})
export class MaterialModule { }
