import { Component, Input, OnInit } from '@angular/core';
import { ScoreSpeler } from '../../../../model/score-beurt';
import { NgClass, SlicePipe } from '@angular/common';

@Component({
    selector: 'app-wed-lijst-speler',
    standalone: true,
    imports: [
        SlicePipe,
        NgClass
    ],
    templateUrl: './wed-lijst-speler.component.html',
    styleUrl: './wed-lijst-speler.component.css'
})
export class WedLijstSpelerComponent implements OnInit {
    @Input() speler: ScoreSpeler = new ScoreSpeler();
    dataReady: boolean = false;

    ngOnInit(): void {
        console.log(this.speler);
        this.dataReady = true;
    }
}
