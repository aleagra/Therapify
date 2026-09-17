import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CanonicalService {
  private document = inject(DOCUMENT);
  private router = inject(Router);
  private readonly baseUrl = 'https://therapifyy.vercel.app';

  init(): void {
    this.updateCanonicalUrl(this.router.url);

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateCanonicalUrl(event.urlAfterRedirects || event.url);
      });
  }

  private updateCanonicalUrl(rawUrl: string): void {
    let cleanPath = (rawUrl.split('?')[0].split('#')[0] || '/').trim();
    if (cleanPath === '/' || cleanPath === '') {
      cleanPath = '/home';
    }
    if (!cleanPath.startsWith('/')) {
      cleanPath = '/' + cleanPath;
    }

    const canonicalUrl = `${this.baseUrl}${cleanPath}`;

    let link: HTMLLinkElement | null = this.document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', canonicalUrl);

    const ogUrl: HTMLMetaElement | null = this.document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute('content', canonicalUrl);
    }

    const twitterUrl: HTMLMetaElement | null = this.document.querySelector('meta[name="twitter:url"]');
    if (twitterUrl) {
      twitterUrl.setAttribute('content', canonicalUrl);
    }
  }
}
