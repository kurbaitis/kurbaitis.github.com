---
layout: post
title:  "Testing test2"
date:   2015-10-03 10:17:58 +0300
---
{% assign p = site.data.posts['2015-10-03'] %}
{{ p.text }}

{% for h in p.hrefs %}
[{{h[0]}}]: {{h[1]}}
{% endfor %}
