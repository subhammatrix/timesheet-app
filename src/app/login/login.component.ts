import { Component, OnInit } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  invalidLogin: any;
  returnUrl: string;

  constructor(private route: ActivatedRoute, private router: Router, private authService: AuthService) {
    // redirect to home if already logged in
    if (this.authService.currentUserValue) {
      this.router.navigate(['/dashboard']);
    }
  }

  ngOnInit() {
    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams.returnUrl || '/dashboard';
  }

  submit(f) {
    this.authService.login(f.controls.username.value, f.controls.password.value)
      .subscribe(
        response => {
          this.router.navigate([this.returnUrl]);
        },
        error => {
          this.invalidLogin = error;
        }
      );
  }

}
