import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-report',
  templateUrl: './report.page.html',
  styleUrls: ['./report.page.scss'],
  standalone: false,
})
export class ReportPage implements OnInit {
  report = {
    crimeType: '',
    date: '',
    time: '',
    location: '',
    description: '',
    reporterName: '',
    contactNumber: '',
    anonymous: false
  };

  crimeTypes = [
    { value: 'theft', label: 'Theft / Larceny' },
    { value: 'robbery', label: 'Robbery' },
    { value: 'assault', label: 'Assault / Battery' },
    { value: 'burglary', label: 'Burglary / Breaking & Entering' },
    { value: 'vandalism', label: 'Vandalism / Property Damage' },
    { value: 'drug', label: 'Drug-related Activity' },
    { value: 'fraud', label: 'Fraud / Scam' },
    { value: 'domestic', label: 'Domestic Violence' },
    { value: 'harassment', label: 'Harassment / Stalking' },
    { value: 'suspicious', label: 'Suspicious Activity' },
    { value: 'other', label: 'Other' }
  ];

  customActionSheetOptions = {
    header: 'Select Crime Type',
    subHeader: 'Choose the category that best describes the incident'
  };

  isSubmitting = false;
  maxDate: string;

  constructor(
    private http: HttpClient,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private router: Router
  ) {
    // Set max date to today
    const today = new Date();
    this.maxDate = today.toISOString().split('T')[0];
  }

  ngOnInit() {
    // Initialize with current date
    this.report.date = this.maxDate;
  }

  async useCurrentLocation() {
    const loading = await this.loadingController.create({
      message: 'Getting your location...',
      duration: 5000
    });
    await loading.present();

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          // Use reverse geocoding to get address (you can use a service like Google Maps API)
          this.report.location = `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
          
          await loading.dismiss();
          const toast = await this.toastController.create({
            message: 'Location captured successfully',
            duration: 2000,
            color: 'success',
            position: 'bottom'
          });
          await toast.present();
        },
        async (error) => {
          await loading.dismiss();
          const alert = await this.alertController.create({
            header: 'Location Error',
            message: 'Unable to get your location. Please enter it manually.',
            buttons: ['OK']
          });
          await alert.present();
        }
      );
    } else {
      await loading.dismiss();
      const alert = await this.alertController.create({
        header: 'Not Supported',
        message: 'Geolocation is not supported by your device.',
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  async callEmergency() {
    const alert = await this.alertController.create({
      header: 'Emergency Call',
      message: 'This will dial 911. Do you want to proceed?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Call Now',
          handler: () => {
            window.open('tel:911', '_system');
          }
        }
      ]
    });
    await alert.present();
  }

  async submitReport() {
    // Validate required fields
    if (!this.report.crimeType || !this.report.date || !this.report.location || !this.report.description) {
      const alert = await this.alertController.create({
        header: 'Incomplete Form',
        message: 'Please fill in all required fields marked with *',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    // Validate description length
    if (this.report.description.length < 20) {
      const alert = await this.alertController.create({
        header: 'Description Too Short',
        message: 'Please provide a more detailed description (at least 20 characters).',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    // Show confirmation dialog
    const confirmAlert = await this.alertController.create({
      header: 'Confirm Submission',
      message: 'Are you sure you want to submit this report?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Submit',
          handler: () => {
            this.performSubmit();
          }
        }
      ]
    });
    await confirmAlert.present();
  }

  async performSubmit() {
    const loading = await this.loadingController.create({
      message: 'Submitting your report...',
      spinner: 'crescent'
    });
    await loading.present();

    this.isSubmitting = true;

    // Prepare form data
    const formData = new FormData();
    formData.append('crime_type', this.report.crimeType);
    formData.append('date', this.report.date);
    formData.append('time', this.report.time || 'Not specified');
    formData.append('location', this.report.location);
    formData.append('description', this.report.description);
    formData.append('reporter_name', this.report.anonymous ? 'Anonymous' : this.report.reporterName);
    formData.append('contact_number', this.report.anonymous ? '' : this.report.contactNumber);
    formData.append('anonymous', this.report.anonymous ? '1' : '0');
    formData.append('timestamp', new Date().toISOString());

    // Submit to server
    this.http.post('http://localhost/e-sumbong/php/submit_report.php', formData)
      .subscribe({
        next: async (response: any) => {
          await loading.dismiss();
          this.isSubmitting = false;

          const alert = await this.alertController.create({
            header: 'Report Submitted',
            message: 'Thank you for your report. Your submission helps keep our community safe. A reference number has been generated for your records.',
            buttons: [
              {
                text: 'View Reports',
                handler: () => {
                  this.router.navigate(['/home']);
                }
              },
              {
                text: 'Submit Another',
                handler: () => {
                  this.resetForm();
                }
              }
            ]
          });
          await alert.present();
        },
        error: async (error) => {
          await loading.dismiss();
          this.isSubmitting = false;

          console.error('Error submitting report:', error);

          const alert = await this.alertController.create({
            header: 'Submission Failed',
            message: 'Unable to submit your report at this time. Please check your internet connection and try again.',
            buttons: [
              {
                text: 'Retry',
                handler: () => {
                  this.performSubmit();
                }
              },
              {
                text: 'Cancel',
                role: 'cancel'
              }
            ]
          });
          await alert.present();
        }
      });
  }

  resetForm() {
    this.report = {
      crimeType: '',
      date: this.maxDate,
      time: '',
      location: '',
      description: '',
      reporterName: '',
      contactNumber: '',
      anonymous: false
    };
  }
}
