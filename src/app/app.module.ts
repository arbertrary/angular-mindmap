import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // <-- NgModel lives here
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { MatDialogModule, MAT_DIALOG_DEFAULT_OPTIONS } from "@angular/material/dialog";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';


import { NgxGraphModule } from '@swimlane/ngx-graph';
import { MindmapComponent } from './mindmap/mindmap.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';

@NgModule({
  declarations: [
    AppComponent,
    MindmapComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    MatDialogModule,
    MatMenuModule,
    MatInputModule,
    MatSelectModule,
    MatSidenavModule,
    BrowserAnimationsModule,
    NgxGraphModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
