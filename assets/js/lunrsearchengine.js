---
layout: null
sitemap: false
---

{% assign counter = 0 %}
var documents = [{% for page in site.pages %}{% if page.url contains '.xml' or page.url contains 'assets' or page.url contains 'category' or page.url contains 'tag' %}{% else %}{
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

var idx = lunr(function () {
    this.ref('id')
    this.field('title')
    this.field('body')

    documents.forEach(function (doc) {
        this.add(doc)
    }, this)
});

function lunr_search(term) {
    var resultsEl = document.getElementById('lunrsearchresults');
    resultsEl.style.display = 'block';
    document.body.classList.add('modal-open');

    resultsEl.innerHTML = '<div id="resultsmodal" class="modal fade show d-block" tabindex="-1" role="dialog" aria-labelledby="resultsmodal"> <div class="modal-dialog shadow-lg" role="document"> <div class="modal-content"> <div class="modal-header" id="modtit"> <button type="button" class="close" id="btnx" data-dismiss="modal" aria-label="Close"> &times; </button> </div> <div class="modal-body"> <ul class="mb-0"> </ul> </div> <div class="modal-footer"><button id="btnx" type="button" class="btn btn-danger btn-sm" data-dismiss="modal">Close</button></div></div> </div></div>';

    if (term) {
        document.getElementById('modtit').innerHTML = "<h5 class='modal-title'>Search results for '" + term + "'</h5>" + document.getElementById('modtit').innerHTML;
        var results = idx.search(term);
        if (results.length > 0) {
            for (var i = 0; i < results.length; i++) {
                var ref = results[i]['ref'];
                var url = documents[ref]['url'];
                var title = documents[ref]['title'];
                var body = documents[ref]['body'].substring(0, 160) + '...';
                document.querySelectorAll('#lunrsearchresults ul')[0].innerHTML += "<li class='lunrsearchresult'><a href='" + url + "'><span class='title'>" + title + "</span><br /><small><span class='body'>" + body + "</span><br /><span class='url'>" + url + "</span></small></a></li>";
            }
        } else {
            document.querySelectorAll('#lunrsearchresults ul')[0].innerHTML = "<li class='lunrsearchresult'>Sorry, no results found. Close & try a different search!</li>";
        }
    }
    return false;
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('lunrsearchresults').addEventListener('click', function (e) {
        if (e.target.id === 'btnx' || e.target.closest('#btnx')) {
            document.getElementById('lunrsearchresults').style.display = 'none';
            document.body.classList.remove('modal-open');
        }
    });
});
