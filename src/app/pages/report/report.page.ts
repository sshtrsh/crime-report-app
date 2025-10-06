import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-report',
  templateUrl: './report.page.html',
  styleUrls: ['./report.page.scss'],
  standalone: false,
})
export class ReportPage {
  report = {
    crimeType: '',
    date: '',
    location: '',
    description: ''
  };

  crimeTypes = [
    'Theft',
    'Robbery',
    'Assault',
    'Burglary',
    'Vandalism',
    'Drug-related',
    'Fraud',
    'Other'
  ];

  constructor(
    private http: HttpClient,
    private alertController: AlertController
  ) {}

  async submitReport() {
    if (!this.report.crimeType || !this.report.date || !this.report.location || !this.report.description) {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Please fill in all fields',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    const formData = new FormData();
    formData.append('crime_type', this.report.crimeType);
    formData.append('date', this.report.date);
    formData.append('location', this.report.location);
    formData.append('description', this.report.description);

    this.http.post('http://localhost/e-sumbong/php/submit_report.php', formData)
      .subscribe({
        next: async (response: any) => {
          const alert = await this.alertController.create({
            header: 'Success',
            message: 'Report submitted successfully',
            buttons: ['OK']
          });
          await alert.present();
          this.resetForm();
        },
        error: async (error) => {
          const alert = await this.alertController.create({
            header: 'Error',
            message: 'Failed to submit report. Please try again.',
            buttons: ['OK']
          });
          await alert.present();
        }
      });
  }

  resetForm() {
    this.report = {
      crimeType: '',
      date: '',
      location: '',
      description: ''
    };
  }
}
