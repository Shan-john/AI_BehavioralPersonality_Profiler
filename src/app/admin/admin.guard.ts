import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { adminloginService } from './adminlogin/adminloginservice';

export const adminGuard = () => {
  const adminService = inject(adminloginService);
  const router = inject(Router);

  if (adminService.isLoggedIn()) {
    return true;
  } else {
    router.navigate(['/admin/adminlogin']);
    return false;
  }
};
