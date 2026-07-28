import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Línea de escaneo decorativa tipo HUD.
 * Colócalo una vez dentro del layout principal; usa `aria-hidden`.
 */
@Component({
  selector: 'metabolic-scanline',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="scanline" aria-hidden="true"></div>`
})
export class ScanlineComponent {}
