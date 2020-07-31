import { TimesheetService } from './../_services/timesheet.service';
import { Component, OnInit } from '@angular/core';
import { User } from '../_models/user';
import { Router } from '@angular/router';
import { AuthService } from '../_services/auth.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  startDateTime: any;
  isStartDateTime = false;
  stopDateTime: any;
  isStopDateTime = false;
  isCaptured = true;
  currentUser: User;
  timeSheets: any;

  projects = ['Wayaj', 'Sunswept', 'AtEase', 'ClaimsReady', 'RateCompareIt'];
  modules = ['Authentication', 'Dashboard', 'Booking Engine', 'Reports'];
  functions = ['FE Development', 'Testing', 'Low Fidelity Design', 'High Fidelity Design', 'BE Development'];
  types = ['Client Call', 'Coding', 'Testing', 'Back-end Design', 'Front-end Design', 'Internal Call'];

  form = new FormGroup({
    date: new FormControl('', [Validators.required]),
    fromTime: new FormControl('', [Validators.required]),
    toTime: new FormControl('', [Validators.required]),
    project: new FormControl('', [Validators.required]),
    module: new FormControl('', [Validators.required]),
    function: new FormControl('', [Validators.required]),
    type: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required]),
  });

  constructor(private router: Router, private authService: AuthService, private timesheetService: TimesheetService) {
    this.authService.currentUser.subscribe(x => {
      this.currentUser = x;
      if (x) {
        this.timesheetService.getAll(x.username).subscribe(result => this.timeSheets = result);
      }
    });
  }

  ngOnInit() {
  }

  get f() {
    return this.form.controls;
  }

  onSubmit() {
    if (this.form.valid) {
      this.timesheetService.save(this.form.value);
      this.form.reset();
    } else {
      this.form.setErrors({ invalidLogin: true });
    }
  }

  start() {
    this.startDateTime = new Date().toLocaleString();
    this.isStartDateTime = true;
  }

  stop() {
    this.stopDateTime = new Date().toLocaleString();
    this.isStopDateTime = true;
    this.isCaptured = false;
  }

  capture() {
    this.form.patchValue({
      date: this.formatDate(this.startDateTime),
      fromTime: '10:00',
      toTime: '19:00'
    });
    this.startDateTime = '';
    this.stopDateTime = '';
    this.isStartDateTime = false;
    this.isStopDateTime = false;
    this.isCaptured = true;
  }

  formatDate(date) {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();
    if (month.length < 2) {
      month = '0' + month;
    }
    if (day.length < 2) {
      day = '0' + day;
    }
    return [year, month, day].join('-');
  }

  timeConversion(s) {
    const ampm = s.split(' ')[1];
    const hours = Number(s.slice(0, 2));
    const time = s.slice(0, -2);
    if (ampm === 'AM') {
      if (hours === 12) { // 12am edge-case
        return time.replace(s.slice(0, 2), '00');
      }
      const timeTokens = time.split(':');
      return timeTokens[0] + ':' + timeTokens[1];
    } else if (ampm === 'PM') {
      if (hours !== 12) {
        return time.replace(s.slice(0, 2), String(hours + 12));
      }
      const timeTokens = time.split(':');
      return timeTokens[0] + ':' + timeTokens[1];
    }
  }

}
