import { Controller, Get, Header, Param, Req } from '@nestjs/common';
import type { Request } from 'express';
import { ProductsService } from '../products/products.service';

// Server-rendered Open Graph tags for social crawlers (Facebook, etc).
// The SPA can't do this: crawlers don't run JS, so they'd only ever see the
// static index.html. nginx routes only crawler User-Agents to /product/:id
// here; real browsers keep getting the SPA untouched. og:url points back at
// the real product page, so a human who clicks the shared post lands there.
@Controller('product')
export class OgController {
  constructor(private readonly productsService: ProductsService) {}

  @Get(':id')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async productOg(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<string> {
    const host = this.headerValue(req.headers.host) ?? 'kistmebel.mk';
    const proto = this.headerValue(req.headers['x-forwarded-proto']) ?? 'https';
    const origin = `${proto}://${host}`;
    const url = `${origin}/product/${encodeURIComponent(id)}`;

    const numericId = Number(id);
    const product = Number.isInteger(numericId)
      ? await this.productsService.findOne(numericId)
      : null;

    if (!product) {
      return this.renderHtml({
        title: 'Kist Mebel',
        description: '',
        image: '',
        url,
      });
    }

    const tr =
      product.translations.find((t) => t.language === 'en') ??
      product.translations[0];

    return this.renderHtml({
      title: tr?.name ?? 'Kist Mebel',
      description: tr?.description ?? '',
      image: this.absoluteImage(product.images?.[0], origin),
      url,
    });
  }

  private headerValue(
    value: string | string[] | undefined,
  ): string | undefined {
    return Array.isArray(value) ? value[0] : value;
  }

  // Stored image paths are either absolute (seed URLs) or relative like
  // /uploads/products/foo.jpg. The latter are publicly served under /api/uploads
  // (nginx strips /api before the backend), so og:image must point there.
  private absoluteImage(path: string | undefined, origin: string): string {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const publicPath = path.startsWith('/uploads') ? `/api${path}` : path;
    return `${origin}${publicPath}`;
  }

  private esc(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private renderHtml(meta: {
    title: string;
    description: string;
    image: string;
    url: string;
  }): string {
    const title = this.esc(meta.title);
    const description = this.esc(meta.description.slice(0, 300));
    const image = this.esc(meta.image);
    const url = this.esc(meta.url);
    const secure = meta.url.startsWith('https://');

    const imageTags = meta.image
      ? `<meta property="og:image" content="${image}" />
    ${secure ? `<meta property="og:image:secure_url" content="${image}" />` : ''}
    <meta name="twitter:image" content="${image}" />`
      : '';

    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta property="og:type" content="product" />
    <meta property="og:site_name" content="Kist Mebel" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${url}" />
    ${imageTags}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <!-- Crawlers ignore this; a human who lands here gets sent to the SPA. -->
    <script>window.location.replace(${JSON.stringify(meta.url)});</script>
  </head>
  <body>
    <p>Redirecting to <a href="${url}">${title}</a>…</p>
  </body>
</html>`;
  }
}
