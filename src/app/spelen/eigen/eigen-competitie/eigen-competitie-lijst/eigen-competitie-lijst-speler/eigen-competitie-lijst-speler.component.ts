import { Component, Input, OnInit } from '@angular/core';
import { ScoreSpeler } from '../../../../../model/score-beurt';
import { NgClass, SlicePipe } from '@angular/common';

@Component({
    selector: 'app-eigen-competitie-lijst-speler',
    standalone: true,
    imports: [
        SlicePipe,
        NgClass
    ],
    templateUrl: './eigen-competitie-lijst-speler.component.html',
    styleUrl: './eigen-competitie-lijst-speler.component.css'
})
export class EigenCompetitieLijstSpelerComponent implements OnInit {
    @Input() speler: ScoreSpeler = new ScoreSpeler();
    dataReady: boolean = false;

    ngOnInit(): void {
        this.dataReady = true;
    }
}
