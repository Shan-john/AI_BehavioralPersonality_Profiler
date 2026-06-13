import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { adminGuard } from './admin.guard';
import { adminloginService } from './adminlogin/adminloginservice';

describe('adminGuard', () => {
  let mockAdminService: jasmine.SpyObj<adminloginService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(() => {
    mockAdminService = jasmine.createSpyObj('adminloginService', ['isLoggedIn']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: adminloginService, useValue: mockAdminService },
        { provide: Router, useValue: mockRouter }
      ]
    });
  });

  it('should return true when admin is logged in', () => {
    mockAdminService.isLoggedIn.and.returnValue(true);

    const result = TestBed.runInInjectionContext(() => adminGuard());

    expect(result).toBeTrue();
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should return false and navigate to admin login when not logged in', () => {
    mockAdminService.isLoggedIn.and.returnValue(false);

    const result = TestBed.runInInjectionContext(() => adminGuard());

    expect(result).toBeFalse();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/adminlogin']);
  });
});
