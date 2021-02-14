window.onload = function(){

    // ------------------------------ Filtrare------------------------------------------- 

    document.getElementById("filtrare").onclick = function(){
        var cartonata = document.getElementById("i_cartonata").checked;
        var pret_max=parseInt(document.getElementById("i_pret").value);
        var categorie=document.getElementById("i_categorie").value;

        var radiobuttons=document.getElementsByName("gr_rad");		
        var status_filtrare = "";
        for(let rad of radiobuttons){
            if(rad.checked){
                status_filtrare = rad.value;
                break;
            }
        }
        if(status_filtrare==""){
            alert("Selectati statusul filtrelor(activare/dezactivare) pentru a putea filtra!");
            return;
        }

        var produse = document.querySelectorAll("#produse article");
        
        for(var prod of produse){
            prod.style.display="block";

            var editie = prod.getElementsByClassName("editie")[0];
            var conditie1 = cartonata && editie.innerHTML.localeCompare("Necartonata")==0;

            var pret = prod.getElementsByClassName("pret")[0].innerHTML;
            var conditie2 = (pret>=pret_max);

            var categorie_prod = prod.getElementsByClassName("categorie")[0];
            var conditie3 = (categorie_prod.innerHTML.localeCompare(categorie) != 0);

            var conditie_totala = conditie1 || conditie2 || conditie3;

            if(status_filtrare.localeCompare("dezactivare")==0){
                conditie_totala = false; 
            }
            
            if(conditie_totala){
                prod.style.display="none";
            }
            
        }
    }


    document.getElementById("resetare-filtre").onclick = function(){

        var radio_buttons = document.getElementsByName("gr_rad");
        for(let i=0;i<radio_buttons.length;i++){
            radio_buttons[i].checked = false
        }

        var categorii = document.getElementById("i_categorie");
        categorii.selectedIndex=0;

        var cartonata = document.getElementById("i_cartonata");
        cartonata.checked = false;

        var pret_range = document.getElementById("i_pret");
        pret_range.value="100";
        document.getElementById("info_range").innerHTML= "100";
        
    }

    
    //-----------------------------------Sortare--------------------------------------- 

    document.getElementById("sort-ascendent").onclick = function(){
        var container_produse = document.getElementById("produse");

        var produse = container_produse.children;
        var v_produse = Array.from(produse);
        v_produse.sort(function(prod_a, prod_b){
            var pret_a = parseInt(prod_a.getElementsByClassName("pret")[0].innerHTML);
            var pret_b = parseInt(prod_b.getElementsByClassName("pret")[0].innerHTML);
            if(pret_a == pret_b){
                let nume_a = prod_a.getElementsByClassName("nume-produs")[0].innerHTML;
                let nume_b = prod_b.getElementsByClassName("nume-produs")[0].innerHTML;
                return nume_a.localeCompare(nume_b);
            }
            return pret_a-pret_b;
        });

        for(let i=0;i<v_produse.length;i++){
            container_produse.appendChild(v_produse[i]);
        }
    }

    document.getElementById("sort-descendent").onclick = function(){
        var container_produse = document.getElementById("produse");

        var produse = container_produse.children;
        var v_produse = Array.from(produse);
        v_produse.sort(function(prod_a, prod_b){
            var pret_a = parseInt(prod_a.getElementsByClassName("pret")[0].innerHTML);
            var pret_b = parseInt(prod_b.getElementsByClassName("pret")[0].innerHTML);
            if(pret_a == pret_b){
                let nume_a = prod_a.getElementsByClassName("nume-produs")[0].innerHTML;
                let nume_b = prod_b.getElementsByClassName("nume-produs")[0].innerHTML;
                return nume_b.localeCompare(nume_a);
            }
            return pret_b - pret_a;
        });

        for(let i=0;i<v_produse.length;i++){
            container_produse.appendChild(v_produse[i]);
        }
    }

    //--------------------------Calculare------------------------------------

    document.getElementById("calculeaza-suma").onclick = function(){
        var produse = document.querySelectorAll("#produse article");
        var sum=0;
        for(var prod of produse){
            var selected = prod.getElementsByClassName("i-select-prod")[0].checked;
            if(selected){
                var pret = parseInt(prod.getElementsByClassName("pret")[0].innerHTML);
                sum = sum + pret;
            }
        }

        document.getElementById("pret-total").innerHTML=String(sum);
        
    }


    
	document.getElementById("i_pret").onchange=function(){
		document.getElementById("info_range").innerHTML= this.value;
	}
}