#!/usr/bin/env python3
"""Rebuild standalone news pages from blogs.html: python3 scripts/build-news.py.

Keep article IDs stable: they are the public URLs. Each entry's first image and
first prose paragraph supply its social preview image and description.
"""
from pathlib import Path
from html import escape, unescape
import re

ROOT = Path(__file__).resolve().parent.parent
BASE = 'https://machadofa.github.io/'
source = (ROOT / 'blogs.html').read_text()

def plain(markup):
    return unescape(re.sub(r'<[^>]+>', '', markup)).strip()

def parent_paths(markup):
    return re.sub(r'(href|src)="(?![a-z]+:|/|#)([^"]+)"', r'\1="../\2"', markup)

header = parent_paths(source.split('<body class="inner-page">', 1)[1].split('<main', 1)[0])
footer = parent_paths(source[source.index('<footer>'):])
stylesheet = re.search(r'<link rel="stylesheet"[^>]+>', source)[0]
script = re.search(r'<script src=[^>]+></script>', source)[0]
(ROOT / 'news').mkdir(exist_ok=True)
for match in re.finditer(r'<article\b[^>]*id="([^"]+)".*?</article>', source, re.S):
    slug, article = match[1], match[0]
    heading = re.search(r'<h2[^>]*>(.*?)</h2>', article, re.S)[1]
    heading = re.sub(r'</?a\b[^>]*>', '', heading)
    title = plain(heading)
    description = plain(re.search(r'<div class="prose">\s*<p>(.*?)</p>', article, re.S)[1])
    image_tag = re.search(r'<img\b[^>]+>', article)[0]
    attrs = dict(re.findall(r'(\w+)="([^"]*)"', image_tag))
    image = BASE + attrs['src']
    url = BASE + 'news/' + slug + '.html'
    meta = {'description': description, 'twitter:card': 'summary_large_image',
            'twitter:title': title, 'twitter:description': description,
            'twitter:image': image, 'twitter:image:alt': unescape(attrs['alt'])}
    og = {'og:type': 'article', 'og:site_name': 'EMORPH2 Lab', 'og:title': title,
          'og:description': description, 'og:url': url, 'og:image': image,
          'og:image:secure_url': image, 'og:image:type': 'image/png' if image.endswith('.png') else 'image/jpeg',
          'og:image:width': attrs['width'], 'og:image:height': attrs['height'],
          'og:image:alt': unescape(attrs['alt'])}
    date = re.search(r'<time datetime="([^"]+)"', article)
    if date:
        og['article:published_time'] = date[1]
    tags = '\n'.join(f'  <meta name="{key}" content="{escape(value, quote=True)}">' for key, value in meta.items())
    tags += '\n' + '\n'.join(f'  <meta property="{key}" content="{escape(value, quote=True)}">' for key, value in og.items())
    article = re.sub(r'\s*<h2[^>]*>.*?</h2>', '', article, count=1, flags=re.S)
    article = article.replace('aria-labelledby="' + re.search(r'aria-labelledby="([^"]+)"', article)[1] + '"', 'aria-labelledby="entry-title"')
    article = parent_paths(article).replace(' loading="lazy"', '')
    page = f'''<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{escape(title)} | EMORPH2 Lab</title>
  {parent_paths(stylesheet)}
  {parent_paths(script)}
  <link rel="canonical" href="{url}">
{tags}
</head>
<body class="inner-page">{header}<main id="main">
  <div class="wrap page-head"><p class="eyebrow"><a href="../blogs.html">← All news</a></p><h1 id="entry-title">{heading}</h1></div>
  <div class="wrap page-content">
    {article}
  </div>
</main>
{footer}'''
    (ROOT / 'news' / (slug + '.html')).write_text(page)
    print('Built news/' + slug + '.html')
