'use strict';

/* global Prefs */

var prefs = new Prefs();

function main() {
    var careerPage = $('body[data-xsl=\'/xsl/ListaCarriereStudente.xsl\']');
    prefs.getStudentId(function(studentId) {
        if (careerPage && studentId) {
            var link = $('table.detail_table tr td a:contains(\'' + studentId + '\')').attr('href');
            if (link) {
                console.log('Redirecting to student id ' +  studentId + '...');
                window.location = link;
            }
        }
    });
}

main();
