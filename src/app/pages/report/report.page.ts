import { Component, OnInit } from '@angular/core';
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
    anonymous: false,
    lat: null as number | null,
    lng: null as number | null
  };

  crimeTypes = [
    { value: 'theft', label: 'Theft / Larceny' },
    { value: 'robbery', label: 'Robbery' },
    { value: 'assault', label: 'Assault / Battery' },
    { value: 'burglary', label: 'Burglary / Breaking & Entering' },
    { value: 'vandalism', label: 'Vandalism / Property Damage' },
    { value: 'drug', label: 'Drug-related Activity' },
    { value: 'fraud', label: 'Fraud / Scam' },
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
      duration: 10000
    });
    await loading.present();

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          // Store coordinates
          this.report.lat = lat;
          this.report.lng = lng;
          
          // Try to get address from coordinates
          await this.getAddressFromCoordinates(lat, lng);
          
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
          let errorMessage = 'Unable to get your location. Please enter it manually.';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access was denied. Please enable location services.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Please try again.';
              break;
          }
          
          const alert = await this.alertController.create({
            header: 'Location Error',
            message: errorMessage,
            buttons: ['OK']
          });
          await alert.present();
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
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

  private async getAddressFromCoordinates(lat: number, lng: number): Promise<void> {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      const data = await response.json();
      
      if (data && data.display_name) {
        // Use the full display name as location
        this.report.location = data.display_name;
      } else {
        // Fallback to coordinates if address not found
        this.report.location = `Near ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      }
    } catch (error) {
      // Fallback to coordinates if geocoding fails
      this.report.location = `Near ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
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

    // Validate location (should have coordinates if using current location)
    if (this.report.location.includes('Near') && (!this.report.lat || !this.report.lng)) {
      const alert = await this.alertController.create({
        header: 'Location Required',
        message: 'Please use the "Use Current Location" button or provide a specific address.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    this.isSubmitting = true;

    const loading = await this.loadingController.create({
      message: 'Submitting your report...',
      spinner: 'crescent'
    });
    await loading.present();

    // Simulate API call delay
    setTimeout(async () => {
      await loading.dismiss();
      this.isSubmitting = false;

      // Save to localStorage (for now)
      this.saveReportToStorage();

      const alert = await this.alertController.create({
        header: 'Report Submitted',
        message: 'Thank you for your report! It will be reviewed by barangay officials.',
        buttons: [
          {
            text: 'Back to Home',
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
    }, 2000);
  }

  private saveReportToStorage() {
    const reports = JSON.parse(localStorage.getItem('crimeReports') || '[]');
    const newReport = {
      ...this.report,
      id: Date.now(), // Use timestamp for unique ID
      status: 'pending',
      timestamp: new Date().toISOString()
    };
    
    reports.push(newReport);
    localStorage.setItem('crimeReports', JSON.stringify(reports));
    
    console.log('Report saved:', newReport);
  }

  private resetForm() {
    this.report = {
      crimeType: '',
      date: this.maxDate,
      time: '',
      location: '',
      description: '',
      reporterName: '',
      contactNumber: '',
      anonymous: false,
      lat: null,
      lng: null
    };
  }
}
