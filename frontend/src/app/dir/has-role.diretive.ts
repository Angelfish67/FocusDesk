import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  inject
} from '@angular/core';
import { AppAuthService } from '../service/app.auth.service';

@Directive({
  selector: '[appHasRole]',
  standalone: true
})
export class HasRoleDirective {

  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);
  private authService = inject(AppAuthService);

  @Input()
  set appHasRole(requiredRoles: string[]) {

    this.authService.getRoles().subscribe(userRoles => {

      const hasRole = requiredRoles.some(role =>
        userRoles.includes(role)
      );

      this.viewContainer.clear();

      if (hasRole) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      }
    });
  }
}