import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'angular-mindmap';
  private darkThemeIcon = 'nightlight_round';
  private lightThemeIcon = 'wb_sunny';
  public lightDarkToggleIcon = this.darkThemeIcon;
  lightToggled = false;

  toggleLightTheme(): void {
    document.body.classList.toggle('light-theme');
    this.lightDarkToggleIcon = this.lightToggled ? this.darkThemeIcon : this.lightThemeIcon;
    this.lightToggled = !this.lightToggled;

  }
}
