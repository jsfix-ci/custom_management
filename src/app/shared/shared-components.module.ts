import { NgModule } from "@angular/core";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoadingScreenComponent } from "./loading-screen/loading-screen.component";

@NgModule({
    declarations: [
        LoadingScreenComponent
    ],
    imports: [
        CommonModule,
        FormsModule
    ],
    providers: [
    ],
    exports: [LoadingScreenComponent],
    bootstrap: [],
})
export class SharedComponentsModule { }
