import { Component, OnInit, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-stats',
  templateUrl: './stats.page.html',
  styleUrls: ['./stats.page.scss'],
  standalone: false,
})
export class StatsPage implements OnInit, AfterViewInit {
  reports: any[] = [];
  barChart: any;
  pieChart: any;
  lineChart: any;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadReports();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.createCharts();
    }, 100);
  }

  loadReports() {
    this.http.get<any>('http://localhost/e-sumbong/php/get_reports.php')
      .subscribe({
        next: (data) => {
          this.reports = data;
          this.createCharts();
        },
        error: (error) => {
          console.error('Error loading reports:', error);
        }
      });
  }

  createCharts() {
    if (!this.reports || this.reports.length === 0) return;

    this.createBarChart();
    this.createPieChart();
    this.createLineChart();
  }

  createBarChart() {
    const crimeTypeCounts: any = {};
    this.reports.forEach(report => {
      const type = report.crime_type || 'Unknown';
      crimeTypeCounts[type] = (crimeTypeCounts[type] || 0) + 1;
    });

    const labels = Object.keys(crimeTypeCounts);
    const data = Object.values(crimeTypeCounts);

    if (this.barChart) {
      this.barChart.destroy();
    }

    const canvas = document.getElementById('barChart') as HTMLCanvasElement;
    if (canvas) {
      this.barChart = new Chart(canvas, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Crime Reports by Type',
            data: data,
            backgroundColor: [
              'rgba(255, 99, 132, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(75, 192, 192, 0.6)',
              'rgba(153, 102, 255, 0.6)',
              'rgba(255, 159, 64, 0.6)'
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
  }

  createPieChart() {
    const crimeTypeCounts: any = {};
    this.reports.forEach(report => {
      const type = report.crime_type || 'Unknown';
      crimeTypeCounts[type] = (crimeTypeCounts[type] || 0) + 1;
    });

    const labels = Object.keys(crimeTypeCounts);
    const data = Object.values(crimeTypeCounts);

    if (this.pieChart) {
      this.pieChart.destroy();
    }

    const canvas = document.getElementById('pieChart') as HTMLCanvasElement;
    if (canvas) {
      this.pieChart = new Chart(canvas, {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: [
              'rgba(255, 99, 132, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(75, 192, 192, 0.6)',
              'rgba(153, 102, 255, 0.6)',
              'rgba(255, 159, 64, 0.6)'
            ]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });
    }
  }

  createLineChart() {
    const reportsByMonth: any = {};
    this.reports.forEach(report => {
      if (report.date) {
        const month = report.date.substring(0, 7);
        reportsByMonth[month] = (reportsByMonth[month] || 0) + 1;
      }
    });

    const sortedMonths = Object.keys(reportsByMonth).sort();
    const data = sortedMonths.map(month => reportsByMonth[month]);

    if (this.lineChart) {
      this.lineChart.destroy();
    }

    const canvas = document.getElementById('lineChart') as HTMLCanvasElement;
    if (canvas) {
      this.lineChart = new Chart(canvas, {
        type: 'line',
        data: {
          labels: sortedMonths,
          datasets: [{
            label: 'Crime Reports Over Time',
            data: data,
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
  }
}
