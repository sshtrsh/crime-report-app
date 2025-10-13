import { Component, OnInit, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
  standalone: false,
})
export class MapPage implements OnInit, AfterViewInit {
  private map: any;
  reports: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.initMap();
    this.loadReports();
  }

  initMap() {
    this.map = L.map('map').setView([14.5995, 120.9842], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    const icon = L.icon({
      iconUrl: 'assets/marker-icon.png',
      shadowUrl: 'assets/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    L.Marker.prototype.options.icon = icon;
  }

  loadReports() {
    this.http.get<any>('http://localhost/e-sumbong/php/get_reports.php')
      .subscribe({
        next: (data) => {
          this.reports = data;
          this.addMarkers();
        },
        error: (error) => {
          console.error('Error loading reports:', error);
        }
      });
  }

  addMarkers() {
    if (!this.map) return;

    this.reports.forEach((report: any) => {
      if (report.latitude && report.longitude) {
        const marker = L.marker([report.latitude, report.longitude])
          .addTo(this.map);

        marker.bindPopup(`
          <b>${report.crime_type}</b><br>
          Location: ${report.location}<br>
          Date: ${report.date}<br>
          ${report.description}
        `);
      }
    });
  }
}
