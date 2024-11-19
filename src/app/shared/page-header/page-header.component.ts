import { Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { BaseComponent } from '../../base/base.component';
import { StatusService } from '../../services/status.service';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-page-header',
    standalone: true,
    imports: [
        NgClass
    ],
    templateUrl: './page-header.component.html',
    styleUrl: './page-header.component.css'
})
export class PageHeaderComponent implements OnInit, OnChanges {
    router = inject(Router);
    appData = inject(StatusService);

    @Input() title: string = '';
    @Input() subtitle: string = '';
    @Input() escCount: number = 0;
    @Input() spel: string = this.appData.getSpelNaam();
    @Input() district: string = '';
    @Output() escClicked: EventEmitter<boolean> = new EventEmitter<boolean>();

    escapes: number[] = [];

    gotoHome() {
        this.router.navigate(['home']);
    }

    escapeClicked() {
        this.escClicked.emit(true);
    }

    private setEscapeButtons() {
        this.escapes = [];
        for (let i = 0; i < this.escCount; i++) {
            this.escapes.push(1);
        }
    }

    ngOnInit(): void {
        this.setEscapeButtons();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['escCount'] && !changes['escCount'].firstChange) {
            this.setEscapeButtons();
        }
    }
}
