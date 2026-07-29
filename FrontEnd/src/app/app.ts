import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './shared/services/auth.service';
import { ToastComponent } from './shared/components/toast/toast.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private readonly auth = inject(AuthService);

  ngOnInit(): void {
    // Si el operador ya tiene sesión, hidratamos su perfil global.
    if (this.auth.isAuthenticated()) {
      this.auth.me().subscribe({ error: () => this.auth.logout() });
    }
  }
}
