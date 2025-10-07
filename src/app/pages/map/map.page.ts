import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet.heat';

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
  standalone: false,
})
export class MapPage implements AfterViewInit {
  private map!: L.Map;
  private markers: L.Marker[] = [];
  private heatmapLayer: any;

  // Map settings
  viewType: 'markers' | 'heatmap' = 'markers';
  selectedCrimeTypes: string[] = [];
  showStatsPanel: boolean = false;
  
  // Crime types for filtering
  crimeTypes = [
    { value: 'theft', label: 'Theft', color: '#ef4444' },
    { value: 'assault', label: 'Assault', color: '#f59e0b' },
    { value: 'burglary', label: 'Burglary', color: '#d97706' },
    { value: 'vandalism', label: 'Vandalism', color: '#7c3aed' },
    { value: 'drug', label: 'Drug', color: '#ec4899' },
    { value: 'fraud', label: 'Fraud', color: '#8b5cf6' },
    { value: 'harassment', label: 'Harassment', color: '#06b6d4' },
    { value: 'other', label: 'Other', color: '#6b7280' }
  ];

  // Sample crime reports data
  private sampleReports = [
    {
      id: 1,
      crimeType: 'theft',
      location: 'Parian Market',
      lat: 14.2002,
      lng: 121.1533,
      description: 'Stolen wallet from market vendor',
      status: 'verified',
      timestamp: '2024-01-15T10:30:00'
    },
    {
      id: 2,
      crimeType: 'assault',
      location: 'Parian Elementary School',
      lat: 14.2015,
      lng: 121.1520,
      description: 'Physical altercation near school gate',
      status: 'verified',
      timestamp: '2024-01-14T18:45:00'
    },
    {
      id: 3,
      crimeType: 'theft',
      location: 'Parian Barangay Hall',
      lat: 14.1998,
      lng: 121.1545,
      description: 'Snatched phone from pedestrian',
      status: 'verified',
      timestamp: '2024-01-13T14:20:00'
    },
    {
      id: 4,
      crimeType: 'vandalism',
      location: 'Parian Basketball Court',
      lat: 14.2020,
      lng: 121.1510,
      description: 'Graffiti on public walls',
      status: 'verified',
      timestamp: '2024-01-12T21:15:00'
    },
    {
      id: 5,
      crimeType: 'drug',
      location: 'Parian Alley 5',
      lat: 14.2005,
      lng: 121.1550,
      description: 'Suspected drug activity',
      status: 'under investigation',
      timestamp: '2024-01-11T23:30:00'
    },
    {
      id: 6,
      crimeType: 'theft',
      location: 'Parian Road',
      lat: 14.2010,
      lng: 121.1540,
      description: 'Car break-in',
      status: 'verified',
      timestamp: '2024-01-10T20:00:00'
    }
  ];

  ngAfterViewInit() {
    setTimeout(() => {
      this.initializeMap();
      this.loadMapData();
    }, 100);
  }

  private initializeMap() {
    try {
      // Barangay Parian, Calamba City coordinates
      const parianCenter: L.LatLngExpression = [14.2000, 121.1530];
      
      this.map = L.map('map').setView(parianCenter, 15);

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
      }).addTo(this.map);

      // Add scale control
      L.control.scale({ imperial: false }).addTo(this.map);

    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  private loadMapData() {
    this.updateMapView();
  }

  // View type controls
  setViewType(type: 'markers' | 'heatmap') {
    this.viewType = type;
    this.updateMapView();
  }

  // Crime type filtering
  toggleCrimeType(crimeType: string) {
    const index = this.selectedCrimeTypes.indexOf(crimeType);
    if (index > -1) {
      this.selectedCrimeTypes.splice(index, 1);
    } else {
      this.selectedCrimeTypes.push(crimeType);
    }
    this.updateMapView();
  }

  // Stats panel toggle
  toggleStatsPanel() {
    this.showStatsPanel = !this.showStatsPanel;
  }

  private updateMapView() {
    this.clearMapLayers();
    
    const filteredReports = this.getFilteredReports();
    
    if (this.viewType === 'markers') {
      this.showMarkers(filteredReports);
    } else {
      this.showHeatmap(filteredReports);
    }
  }

  private showMarkers(reports: any[]) {
    reports.forEach(report => {
      const icon = this.getCrimeIcon(report.crimeType);
      const marker = L.marker([report.lat, report.lng], { icon })
        .bindPopup(this.createPopupContent(report))
        .addTo(this.map);
      
      this.markers.push(marker);
    });
  }

  private showHeatmap(reports: any[]) {
    const heatPoints = reports.map(report => [report.lat, report.lng, 1] as [number, number, number]);
    
    // @ts-ignore - Leaflet heat plugin
    this.heatmapLayer = L.heatLayer(heatPoints, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      gradient: {
        0.4: 'blue',
        0.6: 'cyan',
        0.7: 'lime',
        0.8: 'yellow',
        1.0: 'red'
      }
    }).addTo(this.map);
  }

  private getCrimeIcon(crimeType: string): L.Icon {
    const crimeTypeObj = this.crimeTypes.find(ct => ct.value === crimeType);
    const color = crimeTypeObj ? crimeTypeObj.color : '#6b7280';

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 24 24">
      <path fill="${color}" stroke="#000" stroke-width="1.6" stroke-linejoin="round" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
      <circle cx="12" cy="9.2" r="2.2" fill="#fff" stroke="#000" stroke-width="1"/>
    </svg>`;
    const url = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);

    return L.icon({
      iconUrl: url,
      iconSize: [28, 40],
      iconAnchor: [14, 40],
      popupAnchor: [0, -40]
    });
  }

  private createPopupContent(report: any): string {
    const crimeTypeObj = this.crimeTypes.find(ct => ct.value === report.crimeType);
    const crimeTypeLabel = crimeTypeObj ? crimeTypeObj.label : 'Other';

    return `
      <div style="min-width: 200px; padding: 8px;">
        <div style="background: ${crimeTypeObj?.color}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; margin-bottom: 8px;">
          ${crimeTypeLabel}
        </div>
        <h3 style="margin: 0 0 8px 0; font-size: 14px;">${report.location}</h3>
        <p style="margin: 0 0 6px 0; font-size: 12px; color: #666;"><strong>Date:</strong> ${new Date(report.timestamp).toLocaleDateString()}</p>
        <p style="margin: 0; font-size: 12px; color: #666;"><strong>Description:</strong> ${report.description}</p>
        <div style="margin-top: 8px; padding: 4px; background: #f3f4f6; border-radius: 4px; font-size: 11px;">
          Status: <strong>${report.status}</strong>
        </div>
      </div>
    `;
  }

  private clearMapLayers() {
    // Clear markers
    this.markers.forEach(marker => this.map.removeLayer(marker));
    this.markers = [];

    // Clear heatmap
    if (this.heatmapLayer) {
      this.map.removeLayer(this.heatmapLayer);
      this.heatmapLayer = null;
    }
  }

  private getFilteredReports() {
    if (this.selectedCrimeTypes.length === 0) {
      return this.sampleReports;
    }
    return this.sampleReports.filter(report => 
      this.selectedCrimeTypes.includes(report.crimeType)
    );
  }

  // Statistics Methods
  getTotalReports(): number {
    return this.sampleReports.length;
  }

  getVerifiedReports(): number {
    return this.sampleReports.filter(report => report.status === 'verified').length;
  }

  getTopCrimes(): any[] {
    const crimeCounts: { [key: string]: number } = {};
    
    this.sampleReports.forEach(report => {
      crimeCounts[report.crimeType] = (crimeCounts[report.crimeType] || 0) + 1;
    });

    return Object.entries(crimeCounts)
      .map(([type, count]) => ({
        type: this.crimeTypes.find(ct => ct.value === type)?.label || type,
        count: count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  getRecentReports(days: number): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return this.sampleReports.filter(report => 
      new Date(report.timestamp) >= cutoffDate
    ).length;
  }

  getFilteredReportsCount(): number {
    return this.getFilteredReports().length;
  }

  getClustersCount(): number {
    return 0; // For K-means later
  }

  openFilters() {
    console.log('Filters opened');
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }
}