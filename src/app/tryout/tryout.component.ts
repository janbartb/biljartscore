import { Component } from '@angular/core';
import { PageHeaderComponent } from '../shared/page-header/page-header.component';
import { BaseComponent } from '../base/base.component';
import { GetalComponent } from '../shared/getal/getal.component';

@Component({
    selector: 'app-tryout',
    standalone: true,
    imports: [
    PageHeaderComponent,
    GetalComponent
],
    templateUrl: './tryout.component.html',
    styleUrl: './tryout.component.css'
})
export class TryoutComponent extends BaseComponent {
    val: number = 0;

    increaseVal() {
        this.val++;
    }

    decreaseVal() {
        this.val--;
    }
}
