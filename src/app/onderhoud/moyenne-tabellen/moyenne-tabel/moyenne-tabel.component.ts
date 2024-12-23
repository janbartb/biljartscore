import { Component, Input, OnInit } from '@angular/core';
import { MoyenneTabel } from '../../../model/moyenne-tabel';
import { FormsModule } from '@angular/forms';
import { DecimalPipe, SlicePipe } from '@angular/common';

@Component({
  selector: 'app-moyenne-tabel',
  standalone: true,
  imports: [FormsModule, SlicePipe, DecimalPipe],
  templateUrl: './moyenne-tabel.component.html',
  styleUrl: './moyenne-tabel.component.css'
})
export class MoyenneTabelComponent implements OnInit {
    @Input() tabel: MoyenneTabel = new MoyenneTabel();

    ngOnInit(): void {
        
    }

}
