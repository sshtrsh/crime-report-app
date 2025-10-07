import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage {
  stats = {
    totalReports: 24,
    hotspots: 3,
    trend: '12%'
  };

  constructor(
    private alertController: AlertController,
    private router: Router
  ) {}

  async openAdminLogin() {
    const alert = await this.alertController.create({
      header: 'Admin Access',
      message: 'Enter barangay admin credentials',
      inputs: [
        {
          name: 'username',
          type: 'text',
          placeholder: 'Username',
          value: 'barangay'
        },
        {
          name: 'password', 
          type: 'password',
          placeholder: 'Password',
          value: 'verify123'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Login',
          handler: (data) => {
            if (data.username === 'barangay' && data.password === 'verify123') {
              this.router.navigate(['/admin-dashboard']);
              return true;
            } else {
              this.showErrorAlert('Invalid credentials');
              return false;
            }
          }
        }
      ]
    });

    await alert.present();
  }

  private async showErrorAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Login Failed',
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
