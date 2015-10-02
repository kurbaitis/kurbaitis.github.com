---
layout: post
title:  "Welcome to Jekyll!"
date:   2015-10-02 00:00:00 +300
categories: jekyll update
---
{% assign d = page.date | date: "%Y-%m-%d" %}
{{ d }}
{% assign p = site.data.posts[d] %}
{{ p | json }}
{{ p.text }}

Check out the `test`][jekyll] for more info on how to get the most out of Jekyll. File all bugs/feature requests at [Jekyll’s GitHub repo][jekyll-gh]. If you have questions, you can ask them on [Jekyll’s dedicated Help repository][jekyll-help].

{% for u in p.umap %}
[{{u[0]}}]: {{u[1]}}
{% endfor %}
