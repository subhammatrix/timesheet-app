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
  duration: any;
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
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.timesheetService.getAll(user.username).subscribe(result => this.timeSheets = result);
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
      this.resetForm();
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
      fromTime: this.formatTime(new Date(this.startDateTime).toLocaleTimeString()),
      toTime: this.formatTime(new Date(this.stopDateTime).toLocaleTimeString())
    });
    this.reset();
  }

  reset() {
    this.startDateTime = '';
    this.stopDateTime = '';
    this.isStartDateTime = false;
    this.isStopDateTime = false;
    this.isCaptured = true;
  }

  resetForm() {
    this.form.reset();
    this.form.patchValue({ project: '', module: '', function: '', type: '' });
  }

  // helper functions

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

  formatTime(time) {
    const AMPM = time.slice(-2);
    const timeArr = time.slice(0, -2).split(':');
    if (AMPM === 'AM' && timeArr[0] === '12') {
      // catching edge-case of 12AM
      timeArr[0] = '00';
    } else if (AMPM === 'PM') {
      // everything with PM can just be mod'd and added with 12 - the max will be 23
      timeArr[0] = (timeArr[0] % 12) + 12;
    }
    timeArr.splice(2, 1);
    return timeArr.join(':');
  }

  calculateDuration(start, end) {
    if (start && end) {
      start = start.split(':');
      end = end.split(':');
      const startDate = new Date(0, 0, 0, start[0], start[1], 0);
      const endDate = new Date(0, 0, 0, end[0], end[1], 0);
      let diff = endDate.getTime() - startDate.getTime();
      let hours = Math.floor(diff / 1000 / 60 / 60);
      diff -= hours * 1000 * 60 * 60;
      const minutes = Math.floor(diff / 1000 / 60);
      // If using time pickers with 24 hours format, add the below line get exact hours
      if (hours < 0) {
        hours = hours + 24;
      }
      return (hours <= 9 ? '0' : '') + hours + ':' + (minutes <= 9 ? '0' : '') + minutes;
    }
    return '00:00';
  }

}
