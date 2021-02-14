const express=require('express');

var app=express(); //creare server

const session = require('express-session')
const formidable = require('formidable');
const crypto = require('crypto');
const nodemailer = require("nodemailer");
var mysql = require('mysql');
var path=require('path');
var fs=require('fs');

//setez o sesiune

app.use(session({
	secret: 'abcdefg', //folosit de express session pentru criptarea id-ului de sesiune
	resave: true,
	saveUninitialized: false
  }));

// use ejs
app.set('view engine', 'ejs'); 

//adaugam calea spre folderele statice (fara fisiere generate cu node)
app.use(express.static(path.join(__dirname, "resources")));
app.use('/uploaded_imgs', express.static('uploaded_imgs'));

//-----------------------------------BD-----------------------

var conexiuneBD=mysql.createConnection({
	host:"localhost",
	user:"ion",
	password:"exemplunode123",
	database:"librarie_online"
});

conexiuneBD.connect(function(err){
	if (err) {
		console.log("Conexiune esuata");
		throw err;
	}else{
		console.log("Ne-am conectat la Baza de Date!");
	}
});

//functii utile

function getUtiliz(req){
	var utiliz;
	if(req.session){
		utiliz=req.session.utilizator
	}
	else{utiliz=null}
	return utiliz;
}

//------------------------------------------------------------------

// pt cereri de forma localhost:8080
app.get('/', function(req, res){
	if (req.session){
		//console.log(req.session.utilizator);

		res.render('pagini/index', {utilizator:req.session.utilizator});
	}
	else{
		res.render('pagini/index');
	}

});


//-------------------------------- Sign Up page ------------------------------

async function trimiteMail(username, email){
	var transp= nodemailer.createTransport({
		service: "gmail",
		secure: false,
		auth:{//date login 
			user:"vion22517@gmail.com",
			pass:"TehniciWeb123"
		},
		tls:{
			rejectUnauthorized:false
		}
	});
	//genereaza html
	await transp.sendMail({
		from:"vion22517@gmail.com",
		to:email,
		subject:"Te-ai inregistrat cu succes",
		text:"Username-ul tau este "+username,
		html:"<h1>Salut!</h1><p><span style=\"color:red\">Username-ul</span> tau este "+username+"</p>",
	})
	console.log("trimis mail");
}

var parolaServer="tehniciweb";

app.post("/inreg",function(req, res){
	var username;
	var formular= formidable.IncomingForm()
	console.log("am intrat pe post");
	var cale_imagine="";
	
	//nr ordine: 4
	formular.parse(req, function(err, campuriText, campuriFisier){//se executa dupa ce a fost primit formularul si parsat
		console.log("parsare")
		var eroare="";
		console.log(campuriText);
		//verificari campuri
		if(campuriText.username==""){
			eroare+="Username nesetat";
		}
		var problema_vedere = "0";
		if(campuriText.problema_vedere=="on"){
			problema_vedere = "1";
		}
		
		if(eroare==""){
			//daca nu am erori procesez campurile
			var parolaCriptata=mysql.escape(crypto.scryptSync(campuriText.parola,parolaServer,32).toString("ascii"));
			campuriText.username=mysql.escape(campuriText.username)
			var comanda=`insert into utilizatori (nume, prenume, username,parola, email, problema_vedere, fotografie) values( '${campuriText.nume}', '${campuriText.prenume}',  ${campuriText.username},  ${parolaCriptata}, '${campuriText.email}', '${problema_vedere}' ,'${cale_imagine}' )`;
			console.log(comanda);
			conexiuneBD.query(comanda, function(err, rez, campuri){
				if (err) {
					console.log(err);
					throw err;
				}
				trimiteMail(campuriText.username, campuriText.email);
				console.log("ceva");
				res.render("pagini/sign_up",{err:"",raspuns:"Date introduse"});
			})
		}
		else{
			res.render("pagini/sign_up",{err:eroare,raspuns:"Completati corect campurile"});
		}
	});
	//nr ordine: 1
	formular.on("field", function(name,field){
		if(name=='username')
			username=field;
		console.log("camp - field:", name)
	});
	
	//nr ordine: 2
	formular.on("fileBegin", function(name,campFisier){
		console.log("inceput upload: ", campFisier);
		if(campFisier && campFisier.name!=""){
			//am  fisier transmis
			var cale=__dirname+"/uploaded_imgs/"+username;
			cale_imagine = "/uploaded_imgs/"+username;
			if (!fs.existsSync(cale))
				fs.mkdirSync(cale);
			campFisier.path=cale+"/"+campFisier.name;
			console.log(campFisier.path);
		}
	});
	
	//nr ordine: 3
	formular.on("file", function(name,field){
		console.log("final upload: ", name);
	});
});


//------------------------ Log In / Log Out------------------------------------


app.post("/login",function(req, res){
	var formular= formidable.IncomingForm()
	console.log("am intrat pe login");
	
	formular.parse(req, function(err, campuriText, campuriFisier){//se executa dupa ce a fost primit formularul si parsat
		var parolaCriptata=mysql.escape(crypto.scryptSync(campuriText.parola,parolaServer,32).toString("ascii"));
		campuriText.username=mysql.escape(campuriText.username)
		var comanda=`select rol, email, problema_vedere, fotografie from utilizatori where username=${campuriText.username} and parola=${parolaCriptata}`;
		conexiuneBD.query(comanda, function(err, rez, campuri){
			console.log(comanda);
			if(rez && rez.length==1){
				req.session.utilizator={
					rol:rez[0].rol,
					username:campuriText.username,
					email:rez[0].email,
					problema_vedere:rez[0].problema_vedere,
					fotografie: rez[0].fotografie
				}
				res.render("pagini/index",{utilizator:req.session.utilizator});
			}
			else{
				res.render("pagini/index");
			}
		});
	});
});

app.get('/logout', function(req, res){
	console.log("logout");
	req.session.destroy();
	res.render("pagini/index");
});



//----------------------Produse----------------------------------------

//pt produse
app.get('/produse', function(req, res){
	conexiuneBD.query("select * from carti",function(err, rezultat, campuri){
		if(err) throw err; //pag eroare
		res.render('pagini/produse',{produse:rezultat});
	});
});

//-----------------------------------------------------------------------

//pt orice tip de cerere 
app.get('/*', function(req, res){
	
	res.render('pagini/'+req.url, function(err, rezRandare){
		if(err){ //daca avem eroare
			if(err.message.includes("Failed to lookup view"))
				res.status(404).render('pagini/404');
			else
				throw err;
		}
		else{
			res.send(rezRandare);
		}
	});
	console.log(req.url);
});

app.listen(8080); //serverul asculta pe portul 8080
console.log("A pornit serverul pe portul 8080");