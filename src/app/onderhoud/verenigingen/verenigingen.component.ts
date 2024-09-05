import { Component, inject, OnInit } from '@angular/core';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { NgClass } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { AlertService } from '../../services/alert.service';
import { Router } from '@angular/router';
import { BaseComponent } from '../../base/base.component';

@Component({
  selector: 'app-verenigingen',
  standalone: true,
  imports: [PageHeaderComponent, NgClass],
  templateUrl: './verenigingen.component.html',
  styleUrl: './verenigingen.component.css'
})
export class VerenigingenComponent extends BaseComponent implements OnInit {
    title: string = 'Onderhoud gegevens';
    subtitle: string = 'Verenigingen';

    ngOnInit(): void {
        this.previousUrl = 'onderhoud';
    }
}
