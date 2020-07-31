import { Injectable } from '@angular/core';
import { of } from 'rxjs';

@Injectable()
export class TimesheetService {
  private data = [
    {
      date: '2020-07-29',
      fromTime: '10:00',
      toTime: '19:00',
      project: 'Sunswept',
      module: 'Authentication',
      function: 'FE Development',
      type: 'Coding',
      description: 'Worked on login and logout section with welcome dashboard'
    },
    {
      date: '2020-07-30',
      fromTime: '10:00',
      toTime: '19:00',
      project: 'Sunswept',
      module: 'Dashboard',
      function: 'FE Development',
      type: 'Coding',
      description: 'Worked on dashboard section'
    }
  ];
  constructor() { }

  getAll(username: string) {
    return of(this.data);
  }

  save(obj) {
    this.data.push(obj);
  }
}
