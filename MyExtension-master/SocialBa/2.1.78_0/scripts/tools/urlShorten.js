var urlShorten = {
    getShortUrl: function (arg, site) {
        switch (site) {
            case 'facebook':
            case 'twitter':
                return this.getBitlyShortUrl(arg);
            case 'gplus':
            default:
                return this.getGoogleShortUrl(arg);
        }
    },
    getBitlyShortUrl: function (arg) {
        var url = 'https://api-ssl.bitly.com/v3/shorten';
        url += '?access_token=ebcbb22cf760afadfb171c2d93e154833200146f';
        url += '&longUrl=' + encodeURI(arg.longUrl);

        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, false);
        xhr.send(null);
        var data = JSON.parse(xhr.responseText);
        return data.data.url;
    },
    getGoogleShortUrl: function (arg) {
        var url = 'https://www.googleapis.com/urlshortener/v1/url';

        var xhr = new XMLHttpRequest();
        xhr.open('POST', url, false);
        xhr.setRequestHeader("Content-Type", "application/json");

        xhr.send(JSON.stringify({ "longUrl": arg.longUrl }));

        var data = JSON.parse(xhr.responseText);
        return data.id;
    }
}