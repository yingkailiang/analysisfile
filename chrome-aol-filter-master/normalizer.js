// Object of characters to replace and their replacement values
var charList = {
        'Á':'A', 'É':'E', 'Í':'I', 'Ó':'O', 'Ú':'U', 'Ý':'Y',
        'À':'A', 'È':'E', 'Ì':'I', 'Ò':'O', 'Ù':'U', 'Ỳ':'Y',
        'Ñ':'N'
};

function normalize(string) {
    string = string.toUpperCase();
    string = string.replace(/./g, function(c) {return c in charList? charList[c] : c});
    string = string.replace(/[ \t][ \t]+/g,' ');
    return string.replace(/[^A-Z0-9\n ]/g,'');
}
