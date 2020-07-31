import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, mergeMap, materialize, dematerialize } from 'rxjs/operators';

import { User } from '../_models/user';
import { Role } from '../_models/role';

const users: User[] = [
  { id: 1, username: 'admin', password: 'admin', firstName: 'Super', lastName: 'Admin', role: Role.Admin },
  { id: 2, username: 'brian', password: '123456', firstName: 'Brian', lastName: 'Das', role: Role.User }
];

@Injectable()

export class FakeBackendInterceptor implements HttpInterceptor {

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const { url, method, headers, body } = request;

    // wrap in delayed observable to simulate server api call
    return of(null)
      .pipe(mergeMap(handleRoute))
      .pipe(materialize())
      .pipe(delay(500))
      .pipe(dematerialize());

    function handleRoute() {
      switch (true) {
        case url.endsWith('/api/authenticate') && method === 'POST':
          return authenticate();
        case url.endsWith('/dashboard') && method === 'GET':
          return getUsers();
        default:
          // pass through any requests not handled above
          return next.handle(request);
      }
    }

    // route functions

    function authenticate() {
      const { username, password } = body;
      const user = users.find(x => x.username === username && x.password === password);
      if (!user) { return error('Username or password is incorrect.'); }
      return ok({
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwibmFtZSI6IlRlc3QgVXNlciJ9.
                ELhqw0u1F7QMRZX8cylj7HPClVDQJ17C_WvDLtmS7TY`
      });
    }

    function getUsers() {
      if (!isLoggedIn()) { return unauthorized(); }
      return ok(users);
    }

    // helper functions

    // tslint:disable-next-line: no-shadowed-variable
    function ok(body?) {
      return of(new HttpResponse({ status: 200, body }));
    }

    function error(message) {
      return throwError({ error: { message } });
    }

    function unauthorized() {
      return throwError({ status: 401, error: { message: 'Unauthorised' } });
    }

    function isLoggedIn() {
      return headers.get('Authorization') === `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
        eyJzdWIiOiIxIiwibmFtZSI6IlRlc3QgVXNlciJ9.ELhqw0u1F7QMRZX8cylj7HPClVDQJ17C_WvDLtmS7TY`;
    }
  }
}

export let fakeBackendProvider = {
  // use fake backend in place of Http service for backend-less development
  provide: HTTP_INTERCEPTORS,
  useClass: FakeBackendInterceptor,
  multi: true
};
