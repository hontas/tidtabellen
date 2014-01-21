/* globals moment */

(function() {

    window.TT = {};

    moment.lang('sv');

    function init() {
        $('[data-toggle="tooltip"]').tooltip();
    }

    window.addEventListener("DOMContentLoaded", init);

})();
