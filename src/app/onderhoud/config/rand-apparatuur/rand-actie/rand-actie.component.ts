import { Component, Input, OnInit } from '@angular/core';
import { AppSpelActie } from '../../../../model/config';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-rand-actie',
    standalone: true,
    imports: [
        NgClass
    ],
    templateUrl: './rand-actie.component.html',
    styleUrl: './rand-actie.component.css'
})
export class RandActieComponent {
    @Input() actie: AppSpelActie = new AppSpelActie();
    @Input() selected: boolean = false;
    @Input() apparaat: string = '';
}
