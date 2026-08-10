/* =====================
   ホームメニュー
===================== */

function toggleHomeMenu(){

    const menu =
        document.getElementById("homeMenu");

    const overlay =
        document.getElementById("homeMenuOverlay");

    if(!menu || !overlay) return;

    const isOpen =
        menu.classList.contains("show");

    if(isOpen){

        closeHomeMenu();

    }else{

        menu.classList.add("show");
        overlay.classList.add("show");

    }

}


function closeHomeMenu(){

    const menu =
        document.getElementById("homeMenu");

    const overlay =
        document.getElementById("homeMenuOverlay");

    if(menu){

        menu.classList.remove("show");

    }

    if(overlay){

        overlay.classList.remove("show");

    }

}

