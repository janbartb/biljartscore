import { NgClass, SlicePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { ScoreSpeler } from '../../../../model/score-beurt';

@Component({
    selector: 'app-knbb-match-lijst-speler',
    standalone: true,
    imports: [
        SlicePipe,
        NgClass
    ],
    templateUrl: './knbb-match-lijst-speler.component.html',
    styleUrl: './knbb-match-lijst-speler.component.css'
})
export class KnbbMatchLijstSpelerComponent implements OnInit {
    @Input() speler: ScoreSpeler = new ScoreSpeler();
    dataReady: boolean = false;

    ngOnInit(): void {
        this.dataReady = true;
    }
}
