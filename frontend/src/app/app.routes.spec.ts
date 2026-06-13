import { routes } from './app.routes';
import { Home } from './presentation/home/home';
import { Splash } from './presentation/splash/splash';
import { SignUp } from './presentation/sign-up/sign-up';
import { TestPage } from './presentation/test-page/test-page';
import { Settings } from './presentation/settings/settings';
import { Adminlogin } from './admin/adminlogin/adminlogin';
import { AdminHomepage } from './admin/admin-homepage/admin-homepage';
import { Report } from './admin/report/report';
import { adminGuard } from './admin/admin.guard';

describe('App Routes', () => {
  it('should have routes defined', () => {
    expect(routes).toBeTruthy();
    expect(routes.length).toBeGreaterThan(0);
  });

  it('should have a root route pointing to Splash', () => {
    const rootRoute = routes.find(r => r.path === '');
    expect(rootRoute).toBeTruthy();
    expect(rootRoute!.component).toBe(Splash);
  });

  it('should have a home route', () => {
    const homeRoute = routes.find(r => r.path === 'home');
    expect(homeRoute).toBeTruthy();
    expect(homeRoute!.component).toBe(Home);
  });

  it('should have a signup route', () => {
    const signupRoute = routes.find(r => r.path === 'signup');
    expect(signupRoute).toBeTruthy();
    expect(signupRoute!.component).toBe(SignUp);
  });

  it('should have an admin login route', () => {
    const adminLoginRoute = routes.find(r => r.path === 'admin/adminlogin');
    expect(adminLoginRoute).toBeTruthy();
    expect(adminLoginRoute!.component).toBe(Adminlogin);
  });

  it('should redirect /admin to /admin/admin-homepage', () => {
    const adminRedirect = routes.find(r => r.path === 'admin');
    expect(adminRedirect).toBeTruthy();
    expect(adminRedirect!.redirectTo).toBe('admin/admin-homepage');
    expect(adminRedirect!.pathMatch).toBe('full');
  });

  it('should have admin homepage route with adminGuard', () => {
    const adminHomepage = routes.find(r => r.path === 'admin/admin-homepage');
    expect(adminHomepage).toBeTruthy();
    expect(adminHomepage!.component).toBe(AdminHomepage);
    expect(adminHomepage!.canActivate).toContain(adminGuard);
  });

  it('should have admin report route with adminGuard', () => {
    const reportRoute = routes.find(r => r.path === 'admin/report/:id/:email');
    expect(reportRoute).toBeTruthy();
    expect(reportRoute!.component).toBe(Report);
    expect(reportRoute!.canActivate).toContain(adminGuard);
  });

  it('should have a test page route', () => {
    const testRoute = routes.find(r => r.path === 'home/testpage');
    expect(testRoute).toBeTruthy();
    expect(testRoute!.component).toBe(TestPage);
  });

  it('should have a settings route', () => {
    const settingsRoute = routes.find(r => r.path === 'home/settings');
    expect(settingsRoute).toBeTruthy();
    expect(settingsRoute!.component).toBe(Settings);
  });

  it('should have exactly 9 routes', () => {
    expect(routes.length).toBe(9);
  });
});
