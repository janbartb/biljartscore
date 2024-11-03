import { Component, effect, ElementRef, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges, viewChild } from '@angular/core';
import { MoyenneEntryToAdd, MoyenneTabel, MoyenneTabelEntry } from '../../../model/moyenne-tabel';
import { FormsModule } from '@angular/forms';
import { DecimalPipe, NgClass, SlicePipe } from '@angular/common';
import { HelperService } from '../../../services/helper.service';
import { Button } from '../../../model/button';
import { ButtonComponent } from '../../../shared/button-group/button/button.component';

@Component({
  selector: 'app-moyenne-tabel',
  standalone: true,
  imports: [FormsModule, NgClass, SlicePipe, DecimalPipe, ButtonComponent],
  templateUrl: './moyenne-tabel.component.html',
  styleUrl: './moyenne-tabel.component.css'
})
export class MoyenneTabelComponent implements OnInit {
    @Input() tabel: MoyenneTabel = new MoyenneTabel();

    ngOnInit(): void {
        
    }

}
