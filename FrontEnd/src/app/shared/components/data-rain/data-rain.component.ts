import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  NgZone,
  OnDestroy,
  PLATFORM_ID,
  viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

interface Drop {
  x: number;
  y: number;
  speed: number;
  length: number;
  opacity: number;
  chars: string[];
}

@Component({
  selector: 'metabolic-data-rain',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<canvas #canvas class="data-rain" aria-hidden="true"></canvas>`,
  styles: [`
    :host {
      position: fixed;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      overflow: hidden;
    }
    .data-rain {
      display: block;
      width: 100%;
      height: 100%;
    }
  `],
})
export class DataRainComponent implements AfterViewInit, OnDestroy {
  readonly density = input(80);
  readonly color = input('#4cd7f6');
  readonly bgColor = input('rgba(2,6,23,0.92)');

  private readonly host = inject(ElementRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly canvas = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  private animationId = 0;
  private drops: Drop[] = [];

  private readonly chars = '0123456789ABCDEFabcdef<>/{}[]|&*#+=-~^';
  private ngZone = inject(NgZone);

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.ngZone.runOutsideAngular(() => this.init());
  }

  private init(): void {
    const el = this.canvas()?.nativeElement;
    if (!el) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = this.host.nativeElement.getBoundingClientRect();
    el.width = rect.width * dpr;
    el.height = rect.height * dpr;
    el.style.width = rect.width + 'px';
    el.style.height = rect.height + 'px';

    const ctx = el.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const fontSize = 11;
    const cols = Math.floor(w / (fontSize * 0.8));
    const densityCount = Math.min(this.density(), cols * 3);

    this.drops = Array.from({ length: densityCount }, () => ({
      x: Math.random() * w,
      y: Math.random() * h * -1,
      speed: 0.3 + Math.random() * 1.4,
      length: 6 + Math.floor(Math.random() * 14),
      opacity: 0.08 + Math.random() * 0.35,
      chars: Array.from({ length: 6 + Math.floor(Math.random() * 14) }, () =>
        this.chars[Math.floor(Math.random() * this.chars.length)]
      ),
    }));

    let last = performance.now();

    const draw = (now: number): void => {
      const dt = Math.min((now - last) / 16.67, 3);
      last = now;

      ctx.clearRect(0, 0, w, h);

      const baseColor = this.color();

      for (const drop of this.drops) {
        drop.y += drop.speed * dt;

        if (drop.y - drop.length * fontSize > h) {
          drop.y = -drop.length * fontSize;
          drop.x = Math.random() * w;
          drop.speed = 0.3 + Math.random() * 1.4;
          drop.opacity = 0.08 + Math.random() * 0.35;
          drop.chars = Array.from({ length: 6 + Math.floor(Math.random() * 14) }, () =>
            this.chars[Math.floor(Math.random() * this.chars.length)]
          );
        }

        const startY = Math.max(0, drop.y - drop.length * fontSize);
        const visible = drop.y - startY;

        for (let i = 0; i < drop.chars.length; i++) {
          const cy = drop.y - i * fontSize;
          if (cy < -fontSize || cy > h + fontSize) continue;

          const t = i / drop.chars.length;
          const alpha = i === 0
            ? Math.min(drop.opacity * 1.6, 0.6)
            : drop.opacity * (1 - t * 0.7);

          ctx.globalAlpha = Math.max(0, alpha);
          ctx.fillStyle = baseColor;
          ctx.font = `${fontSize}px "Space Mono", monospace`;
          ctx.fillText(drop.chars[i]!, drop.x, cy);
        }
      }

      this.animationId = requestAnimationFrame(draw);
    };

    this.animationId = requestAnimationFrame(draw);
  }

  ngOnDestroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}
