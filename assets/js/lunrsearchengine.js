---
layout: null
sitemap: false
---

{% assign counter = 0 %}
(function () {
const documents = [{% for page in site.pages %}{% if page.url contains '.xml' or page.url contains 'assets' or page.url contains 'category' or page.url contains 'tag' %}{% else %}{
    "id": {{ counter }},
    "url": "{{ site.url }}{{site.baseurl}}{{ page.url }}",
    "title": "{{ page.title }}",
    "body": "{{ page.content | markdownify | replace: '.', '. ' | replace: '</h2>', ': ' | replace: '</h3>', ': ' | replace: '</h4>', ': ' | replace: '</p>', ' ' | strip_html | strip_newlines | replace: '  ', ' ' | replace: '"', ' ' }}"{% assign counter = counter | plus: 1 %}
    }, {% endif %}{% endfor %}{% for page in site.without-plugin %}{
    "id": {{ counter }},
    "url": "{{ site.url }}{{site.baseurl}}{{ page.url }}",
    "title": "{{ page.title }}",
    "body": "{{ page.content | markdownify | replace: '.', '. ' | replace: '</h2>', ': ' | replace: '</h3>', ': ' | replace: '</h4>', ': ' | replace: '</p>', ' ' | strip_html | strip_newlines | replace: '  ', ' ' | replace: '"', ' ' }}"{% assign counter = counter | plus: 1 %}
    }, {% endfor %}{% for page in site.posts %}{
    "id": {{ counter }},
    "url": "{{ site.url }}{{site.baseurl}}{{ page.url }}",
    "title": "{{ page.title }}",
    "body": "{{ page.date | date: "%Y/%m/%d" }} - {{ page.content | markdownify | replace: '.', '. ' | replace: '</h2>', ': ' | replace: '</h3>', ': ' | replace: '</h4>', ': ' | replace: '</p>', ' ' | strip_html | strip_newlines | replace: '  ', ' ' | replace: '"', ' ' }}"{% assign counter = counter | plus: 1 %}
    }{% if forloop.last %}{% else %}, {% endif %}{% endfor %}];

const idx = lunr(function () {
    this.ref('id')
    this.field('title')
    this.field('body')

    documents.forEach(function (doc) {
        this.add(doc)
    }, this)
});

function escapeHtml(s) {
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
}

window.lunr_search = function (term) {
    const resultsEl = document.getElementById('lunrsearchresults');
    resultsEl.style.display = 'block';
    document.body.classList.add('modal-open');

    resultsEl.innerHTML = '<div id="resultsmodal" class="modal fade show d-block" tabindex="-1" aria-modal="true" aria-label="Search results"> <div class="modal-dialog shadow-lg"> <div class="modal-content"> <div class="modal-header" id="modtit"> <button type="button" class="btn-close close-search" aria-label="Close"></button> </div> <div class="modal-body"> <ul class="mb-0"> </ul> </div> <div class="modal-footer"><button type="button" class="btn btn-danger btn-sm close-search">Close</button></div></div> </div></div>';

    if (term) {
        document.getElementById('modtit').innerHTML = "<h5 class='modal-title'>Search results for '" + escapeHtml(term) + "'</h5>" + document.getElementById('modtit').innerHTML;
        const results = idx.search(term);
        const listEl = document.querySelectorAll('#lunrsearchresults ul')[0];
        if (results.length > 0) {
            let html = '';
            for (let i = 0; i < results.length; i++) {
                const ref = results[i]['ref'];
                const url = documents[ref]['url'];
                const title = documents[ref]['title'];
                const body = documents[ref]['body'].substring(0, 160) + '...';
                html += "<li class='lunrsearchresult'><a href='" + escapeHtml(url) + "'><span class='title'>" + escapeHtml(title) + "</span><br /><small><span class='body'>" + escapeHtml(body) + "</span><br /><span class='url'>" + escapeHtml(url) + "</span></small></a></li>";
            }
            listEl.innerHTML = html;
        } else {
            listEl.innerHTML = "<li class='lunrsearchresult'>Sorry, no results found. Close & try a different search!</li>";
        }
    }
    return false;
};

document.getElementById('lunrsearchresults').addEventListener('click', function (e) {
    if (e.target.classList.contains('close-search') || e.target.closest('.close-search')) {
        document.getElementById('lunrsearchresults').style.display = 'none';
        document.body.classList.remove('modal-open');
    }
});
})();
