window.onload = function () {

    var linkuriMeniu = document.querySelectorAll("ul.menu a");
    var locatie = window.location.pathname;
    //console.log(locatie);

    for (var link of linkuriMeniu) {
        
        if (link.href.endsWith(locatie)) {
            link.style.backgroundColor = "#A52A2A";
        }

        link.onclick = function () {
            var chMenu = document.getElementById("ch-menu");
            chMenu.checked = false;
            var chSubmeniu = document.getElementsByClassName("ch-submenu");
            for (var chs of chSubmeniu) {
                chs.checked = false;
            }
        }

    }
}