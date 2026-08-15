import {
  Component,
  inject,
  Input,
  ViewChild,
  ViewChildren,
  ElementRef,
  QueryList,
  AfterViewInit,
  OnDestroy,
  signal,
  effect
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { StateService } from '@core/services/state.service';
import { TranslationService } from '@core/services/translation.service';
import { IconComponent } from '@shared/components/icon/icon.component';
import { LogoComponent } from '@shared/components/logo/logo.component';
import { ThemeSwitcherComponent } from '@shared/components/theme-switcher/theme-switcher.component';
import { TxSpeedSelectorComponent } from '@shared/components/tx-speed-selector/tx-speed-selector.component';
import { LanguageSelectorComponent } from '@shared/components/language-selector/language-selector.component';
import { TranslatePipe } from '@shared/pipes/translate.pipe';

export interface NavItem {
  readonly labelKey: string;
  readonly path: string;
  readonly icon: string;
  readonly exact?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IconComponent,
    LogoComponent,
    ThemeSwitcherComponent,
    TxSpeedSelectorComponent,
    LanguageSelectorComponent,
    TranslatePipe,
  ],
  templateUrl: './sidebar.component.html',
  styles: [
    `
      :host {
        display: contents;
      }
    `,
  ],
})
export class SidebarComponent implements AfterViewInit, OnDestroy {
  public stateService = inject(StateService);
  public translationService = inject(TranslationService);
  private router = inject(Router);

  @Input() set enableMenuAnimation(value: boolean) {
    this.isSidebarAnimationEnabled.set(value);
  }
  public readonly isSidebarAnimationEnabled = signal<boolean>(false);

  @ViewChild('desktopNavEl') desktopNavEl?: ElementRef<HTMLElement>;
  @ViewChildren('desktopNavItemEl') desktopNavItemEls?: QueryList<ElementRef<HTMLAnchorElement>>;

  public readonly indicatorStyle = signal<{
    top: string;
    height: string;
    left: string;
    width: string;
    ready: boolean;
    animated: boolean;
  }>({
    top: '0px',
    height: '0px',
    left: '0px',
    width: '0px',
    ready: false,
    animated: false
  });

  private resizeObserver?: ResizeObserver;
  private routerSub?: Subscription;

  public readonly navItems: readonly NavItem[] = [
    { labelKey: 'nav.home', path: '/home', icon: 'home', exact: true },
    { labelKey: 'nav.about', path: '/about', icon: 'info' },
    { labelKey: 'nav.contact', path: '/contact', icon: 'send' },
  ];

  constructor() {
    effect(() => {
      const isAnimEnabled = this.isSidebarAnimationEnabled();
      this.stateService.isSidebarCollapsed();

      if (isAnimEnabled) {
        this.updateIndicatorPosition(false);
        requestAnimationFrame(() => {
          this.updateIndicatorPosition(false);
          requestAnimationFrame(() => {
            if (this.indicatorStyle().ready) {
              this.indicatorStyle.update((s) => ({ ...s, animated: true }));
            }
          });
        });
      } else {
        this.indicatorStyle.set({
          top: '0px',
          height: '0px',
          left: '0px',
          width: '0px',
          ready: false,
          animated: false
        });
      }
    });
  }

  ngAfterViewInit(): void {
    this.updateIndicatorPosition(false);

    requestAnimationFrame(() => {
      this.updateIndicatorPosition(false);
      requestAnimationFrame(() => {
        if (this.indicatorStyle().ready) {
          this.indicatorStyle.update((s) => ({ ...s, animated: true }));
        }
      });
    });

    setTimeout(() => this.updateIndicatorPosition(true), 50);
    setTimeout(() => this.updateIndicatorPosition(true), 150);
    setTimeout(() => this.updateIndicatorPosition(true), 300);

    if (typeof document !== 'undefined' && 'fonts' in document) {
      document.fonts.ready.then(() => {
        this.updateIndicatorPosition(true);
      });
    }

    this.routerSub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => {
        if (this.isSidebarAnimationEnabled()) {
          setTimeout(() => this.updateIndicatorPosition(true), 0);
        }
      });

    this.setupResizeObserver();
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  }

  private setupResizeObserver(): void {
    if (typeof ResizeObserver === 'undefined') return;

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    this.resizeObserver = new ResizeObserver(() => {
      if (this.isSidebarAnimationEnabled()) {
        this.updateIndicatorPosition(true);
      }
    });

    if (this.desktopNavEl?.nativeElement) {
      this.resizeObserver.observe(this.desktopNavEl.nativeElement);
    }

    if (this.desktopNavItemEls) {
      this.desktopNavItemEls.forEach((item) => {
        if (item.nativeElement) {
          this.resizeObserver?.observe(item.nativeElement);
        }
      });
    }
  }

  public getActiveIndex(): number {
    const activeIdx = this.navItems.findIndex((item) =>
      this.router.isActive(item.path, {
        paths: item.exact ? 'exact' : 'subset',
        queryParams: 'ignored',
        fragment: 'ignored',
        matrixParams: 'ignored'
      })
    );
    if (activeIdx !== -1) {
      return activeIdx;
    }

    const currentUrl = this.router.url.split('?')[0].split('#')[0];
    return this.navItems.findIndex((item) => {
      if (item.exact || item.path === '/home' || item.path === '/') {
        return currentUrl === item.path || (item.path === '/home' && (currentUrl === '/' || currentUrl === ''));
      }
      return currentUrl === item.path || currentUrl.startsWith(item.path + '/');
    });
  }

  public onNavItemClick(index: number): void {
    if (this.isSidebarAnimationEnabled()) {
      const items = this.desktopNavItemEls?.toArray();
      if (items && items[index]) {
        const activeEl = items[index].nativeElement;
        if (activeEl.offsetHeight > 0) {
          this.indicatorStyle.set({
            top: `${activeEl.offsetTop}px`,
            height: `${activeEl.offsetHeight}px`,
            left: `${activeEl.offsetLeft}px`,
            width: `${activeEl.offsetWidth}px`,
            ready: true,
            animated: true
          });
        }
      }
    }
  }

  public updateIndicatorPosition(enableAnimation: boolean = true): void {
    if (!this.isSidebarAnimationEnabled()) return;
    if (!this.desktopNavItemEls || !this.desktopNavEl) return;

    const items = this.desktopNavItemEls.toArray();
    const activeIdx = this.getActiveIndex();

    if (activeIdx !== -1 && items[activeIdx]) {
      const activeEl = items[activeIdx].nativeElement;
      if (activeEl.offsetHeight === 0) return;

      const nextTop = `${activeEl.offsetTop}px`;
      const nextHeight = `${activeEl.offsetHeight}px`;
      const nextLeft = `${activeEl.offsetLeft}px`;
      const nextWidth = `${activeEl.offsetWidth}px`;

      const current = this.indicatorStyle();
      const shouldAnimate = enableAnimation && current.ready;

      this.indicatorStyle.set({
        top: nextTop,
        height: nextHeight,
        left: nextLeft,
        width: nextWidth,
        ready: true,
        animated: shouldAnimate
      });
    } else {
      const current = this.indicatorStyle();
      if (current.ready) {
        this.indicatorStyle.set({
          top: '0px',
          height: '0px',
          left: '0px',
          width: '0px',
          ready: false,
          animated: false
        });
      }
    }
  }
}

