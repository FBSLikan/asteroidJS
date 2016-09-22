// Asteriods
// Baseado no código de  Chris Giles http://www.chrisacoder.com/2013/02/06/asteroids-in-javascript/

var canvas, context, nave, asteroide, vida,misseis, highscore, powerup,teclas, tempo, nivel, pontuacao, intervalo, estado, tempoDeMudança;
var maxvidas = 3;
var DelayEntreDisparos = 25;


var TipoDeObjeto = {
    _Nave : 0,
    _Asteroide : 1,
    _Disparo : 2,
    _PowerUp : 3
};

var EstadoDoJogo = {
    _Titulo : 0,
    _IniciandoNivel : 1,
    _Jogando : 2,
    _Morreu : 3,
    _FimDeJogo : 4
};

// funções utilitárias

Array.prototype.remove = function(from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};

function testarCordenadas(vertx, verty, testx, testy) {
    var i, j, c = false;
    for (i = 0, j = vertx.length - 1; i < vertx.length; j = i++) {
        if ( ((verty[i] > testy) != (verty[j] > testy)) && 
            (testx < (vertx[j] - vertx[i]) * (testy - verty[i]) / (verty[j] - verty[i]) + vertx[i]) ) {
            c = !c;
        }
    }
    return c;
}

function testarObjetos(vertxIn, vertyIn, vertxOut, vertyOut, tx, ty, rotation) {
    var cosR = Math.cos(rotation);
    var sinR = Math.sin(rotation);
    for (i = 0; i < vertxIn.length; i++) {
        vertxOut[i] = vertxIn[i] * cosR - vertyIn[i] * sinR + tx;
        vertyOut[i] = vertxIn[i] * sinR + vertyIn[i] * cosR + ty;
    }
}



// funções de desenho

function desenharObjetoNaPosicao(objeto, x, y) {
    context.translate(x, y);
    context.rotate(objeto.rotation);
    context.beginPath();
    context.moveTo(objeto.polygonX[0], objeto.polygonY[0]);
    for (i = 1; i < objeto.polygonX.length; i++) {
        context.lineTo(objeto.polygonX[i], objeto.polygonY[i]);
    }
    context.closePath();
    context.lineWidth = 1.5;
    context.fillStyle = objeto.fillColor;
    context.fill();
    context.strokeStyle = objeto.strokeColor;
    context.stroke();
    context.rotate(-objeto.rotation);
    context.translate(-x, -y);
}

function desenharObjeto(objeto) {
    if (objeto == null)
        return;

    desenharObjetoNaPosicao(objeto, objeto.x, objeto.y);
    if (objeto.x > canvas.width / 2) {
        desenharObjetoNaPosicao(objeto, objeto.x - canvas.width, objeto.y);
        if (objeto.y > canvas.height / 2) {
            desenharObjetoNaPosicao(objeto, objeto.x - canvas.width, objeto.y - canvas.height);
            desenharObjetoNaPosicao(objeto, objeto.x, objeto.y - canvas.height);
        }
        else {
            desenharObjetoNaPosicao(objeto, objeto.x - canvas.width, objeto.y + canvas.height);
            desenharObjetoNaPosicao(objeto, objeto.x, objeto.y + canvas.height);
        }
    }
    else {
        desenharObjetoNaPosicao(objeto, objeto.x + canvas.width, objeto.y);
        if (objeto.y > canvas.height / 2) {
            desenharObjetoNaPosicao(objeto, objeto.x + canvas.width, objeto.y - canvas.height);
            desenharObjetoNaPosicao(objeto, objeto.x, objeto.y - canvas.height);
        }
        else {
            desenharObjetoNaPosicao(objeto, objeto.x + canvas.width, objeto.y + canvas.height);
            desenharObjetoNaPosicao(objeto, objeto.x, objeto.y + canvas.height);
        }
    }
}



function escreverNaTela() {
    
    context.strokeStyle = "#00FF00";
    context.font = "30px Arial";
	
    if (estado == EstadoDoJogo._Titulo) {
        var texto = "Pressione Espaço para Jogar";
        var textWidth = context.measureText(texto).width;
        context.fillText(texto, canvas.width / 2 - textWidth / 2, canvas.height / 2, textWidth);
        context.strokeText(texto, canvas.width / 2 - textWidth / 2, canvas.height / 2, textWidth);
    }
    else if (estado == EstadoDoJogo._IniciandoNivel) {
        var texto = "Nível" + nivel;
        var textWidth = context.measureText(texto).width;
        context.fillText(texto, canvas.width / 2 - textWidth / 2, canvas.height / 2, textWidth);
        context.strokeText(texto, canvas.width / 2 - textWidth / 2, canvas.height / 2, textWidth);
    }
    else if (estado == EstadoDoJogo._Morreu) {
        var texto = "Você está morto.";
        var textWidth = context.measureText(texto).width;
        context.fillText(texto, canvas.width / 2 - textWidth / 2, canvas.height / 2, textWidth);
        context.strokeText(texto, canvas.width / 2 - textWidth / 2, canvas.height / 2, textWidth);
		
        texto = "Pontuação atingida: " + pontuacao;
        textWidth = context.measureText(texto).width;
        context.fillText(texto, canvas.width / 2 - textWidth / 2, canvas.height / 2 + 42, textWidth);
        context.strokeText(texto, canvas.width / 2 - textWidth / 2, canvas.height / 2 + 42, textWidth);
        texto = "VIDAS RESTANTES: " + vida;
        textWidth = context.measureText(texto).width;
        context.fillText(texto, canvas.width / 2 - textWidth / 2, canvas.height / 2 + 84, textWidth);
        context.strokeText(texto, canvas.width / 2 - textWidth / 2, canvas.height / 2 + 84, textWidth);
    }
    else if (estado == EstadoDoJogo._FimDeJogo) {
        var texto = "FIM DE JOGO.";
        var textWidth = context.measureText(texto).width;
        context.fillStyle="#000000";
        context.strokeStyle = "#FF0000";
        context.font = "49px Times New Roman";
        context.fillText(texto, canvas.width / 2 - textWidth / 2, canvas.height / 2 - 42, textWidth);
        context.strokeText(texto, canvas.width / 2 - textWidth / 2, canvas.height / 2 -42, textWidth);
        
        context.fillStyle = "#00FF00";
        context.font = "20px Arial";
        texto = "<pressione espaço para reiniciar> ";
        textWidth = context.measureText(texto).width;
        context.fillText(texto, canvas.width / 2 - textWidth / 2, canvas.height -42, textWidth);
        
       
    }

}

// Object update functions

function integracaoDosObjetos(obj) {
    if (obj == null)
        return;

    obj.x += obj.vx;
    obj.y += obj.vy;
    obj.rotation += obj.va;

    if (obj.x > canvas.width)
        obj.x = 0;
    
    else if (obj.x < 0)
        obj.x = canvas.width;

    if (obj.y > canvas.height)
        obj.y = 0;
    
    else if (obj.y < 0)
        obj.y = canvas.height;
}

function testarColisoes(objeto1, objeto2) {
    var x1 = [], y1 = [], x2 = [], y2 = [];
    testarObjetos(objeto1.polygonX, objeto1.polygonY, x1, y1, objeto1.x, objeto1.y, objeto1.rotation);
    testarObjetos(objeto2.polygonX, objeto2.polygonY, x2, y2, objeto2.x, objeto2.y, objeto2.rotation);
	
    for (i = 0; i < x1.length; i++) {
        if (testarCordenadas(x2, y2, x1[i], y1[i])) {
            return true;
        }
    }
	
    for (i = 0; i < x2.length; i++) {
        if (testarCordenadas(x1, y1, x2[i], y2[i])) {
            return true;
        }
    }
	
    return false;
}

// Funções para criação dos objetos do jogo

function criarAsteroides(x, y, vx, vy, va, radius) {
    var rocha = new Object();
    rocha.type = TipoDeObjeto._Asteroide;
    rocha.radius = radius;
    rocha.x = x;
    rocha.y = y;
    rocha.vx = vx;
    rocha.vy = vy;
    rocha.va = va;
    rocha.rotation = 5;
    rocha.strokeColor = "#707070";
    rocha.fillColor = "#404040";
    rocha.polygonX = [];
    rocha.polygonY = [];

    var i = 0;
    for (var t = 0; t < Math.PI * 2; t += Math.random() * Math.PI / 2) {
        var r = Math.random() * radius / 2 + radius / 2;
        rocha.polygonX[i] = Math.cos(t) * r;
        rocha.polygonY[i] = Math.sin(t) * r;
        i++;
    }

    return rocha;
}

function criarNave() {
    var nave = new Object();
    nave.type = TipoDeObjeto._Nave;
    nave.x = canvas.width / 2;
    nave.y = canvas.height / 2;
    nave.vx = 0;
    nave.vy = 0;
    nave.va = 0;
    nave.rotation = 0;
    nave.strokeColor = "#00FF00";
    nave.fillColor = "#009000";
    nave.polygonX = [];
    nave.polygonY = [];
    nave.polygonX[0] = -10; nave.polygonY[0] = -5;
    nave.polygonX[1] = 10;  nave.polygonY[1] = 0;
    nave.polygonX[2] = -10; nave.polygonY[2] = 5;

    return nave;
}

function criarMisseis(x, y, vx, vy) {
    var missel = new Object();
    missel.type = TipoDeObjeto._Disparo;
    missel.x = x;
    missel.y = y;
    missel.vx = vx;
    missel.vy = vy;
    missel.va = 0;
    missel.rotation = 0;
    missel.strokeColor = "#00FF00";
    missel.fillColor = "#009000";
    missel.timeToLive = 75;
    missel.polygonX = [];
    missel.polygonY = [];
    missel.polygonX[0] = -1; missel.polygonY[0] = -1;
    missel.polygonX[1] = 1;  missel.polygonY[1] = -1;
    missel.polygonX[2] = 1;  missel.polygonY[2] = 1;
    missel.polygonX[3] = -1; missel.polygonY[3] = 1;
    return missel;
}

// Funções principais do jogo

function jogo() {
    
    tempo = 0;
    intervalo = 0;
	
    if (estado == EstadoDoJogo._Titulo)
        nave = null;
    else
        nave = criarNave();

    asteroide = [];
    numAsteroides = 4;
    for (var i = 0; i < Math.min(Math.max(nivel, numAsteroides*nivel), 8); i++) {
        var x = Math.random()*Math.random()*numAsteroides*canvas.width/canvas.height;
        
        var y = Math.random()*Math.random()*numAsteroides*canvas.width/canvas.height;
        
        //direção X dos asteroides
        var vx = Math.random()*Math.random()*numAsteroides*canvas.width/canvas.height;
	//direção Y dos asteroides
        var vy = Math.random()*Math.random()*numAsteroides*canvas.width/canvas.height;

	//velocidade de rotação dos asteroides
        var va = Math.random() * Math.min(nivel + 1, 5) / 30 - Math.min(nivel + 1, 5) / 80;

        if (nivel < 15){
            asteroide[i] = criarAsteroides(x, y, vx, vy, va, Math.random() * 30 + 30);
            DelayEntreDisparos = 25;
        }
        else if (nivel >15 && nivel < 30){
            asteroide[i] = criarAsteroides(x, y, vx, vy, va, Math.random() * nivel*2 + nivel*2);
            DelayEntreDisparos = 10;
        }
        else{
            asteroide[i] = criarAsteroides(x, y, vx, vy, va, Math.random() * nivel*3 + nivel*3);
            DelayEntreDisparos = 5;
        }
    }

    misseis = [];

	
}

function atualizarTela() {
    if (vida > 0){
        if (estado == EstadoDoJogo._Titulo) {
	    if (teclas[32]) {
                pontuacao = 0;
                nivel = 1;
                jogo();
                teclas[32] = false;
                estado = EstadoDoJogo._IniciandoNivel;
                tempoDeMudança = tempo + 150;
            }
	}
	else if (estado == EstadoDoJogo._IniciandoNivel) {
            if (tempo >= tempoDeMudança) {
                jogo();
                estado = EstadoDoJogo._Jogando;
                tempoDeMudança = tempo + 10000000;
            }
	}
	else if (estado == EstadoDoJogo._FimDeJogo) {
            if (tempo >= tempoDeMudança) {
                estado = EstadoDoJogo._Titulo;
            }
	}
	else {
            var turnSpeed = 0.05;
            var moveSpeed = 0.05;
            if (teclas[37])
                nave.rotation -= turnSpeed;
            if (teclas[39])
                nave.rotation += turnSpeed;
            if (teclas[38]) {
                nave.vx += Math.cos(nave.rotation) * moveSpeed;
                nave.vy += Math.sin(nave.rotation) * moveSpeed;

                for (var i = 0; i < 3; i++) {
                    var dir = nave.rotation + Math.random() * Math.PI / 2 - Math.PI / 4;
                    var speed = -(0.75 + Math.random() * 0.75);
                    var vx = Math.cos(dir) * speed + nave.vx, vy = Math.sin(dir) * speed + nave.vy;
                }
            }
            if (teclas[32] && intervalo <= 0) {
                var vx = Math.cos(nave.rotation) * 4 + nave.vx;
                var vy = Math.sin(nave.rotation) * 4 + nave.vy;
                var b = criarMisseis(nave.x, nave.y, vx, vy);
                misseis[misseis.length] = b;
                intervalo = DelayEntreDisparos; //tempo entre um disparo e utro
            }
        }

	integracaoDosObjetos(nave);
	
	for (var i = 0; i < asteroide.length; i++) {
            integracaoDosObjetos(asteroide[i]);

            if (nave != null && testarColisoes(nave, asteroide[i])) {

                for (var i = 0; i < 16; i++) {
                    var dir = nave.rotation + Math.random() * Math.PI * 2;
                    var speed = -1 + Math.random() * 2;
                    var vx = Math.cos(dir) * speed - nave.vx * 0.5, vy = Math.sin(dir) * speed - nave.vy * 0.5;
                }

                nave = null;
                estado = EstadoDoJogo._Morreu;
                tempoDeMudança = tempo + 300;
                nivel = 0;
                vida -=1;
            }
	}

	
	for (var i = 0; i < misseis.length; i++) {
            integracaoDosObjetos(misseis[i]);
            misseis[i].timeToLive -= 1;

            if (misseis[i].timeToLive <= 0) {
                misseis.remove(i--);
                continue;
            }

            for (var j = 0; j < asteroide.length; j++) {
                if (testarColisoes(misseis[i], asteroide[j])) {
                    var asteroideAntigo = asteroide[j];

                    misseis.remove(i--);
                    asteroide.remove(j);

                    for (var i = 0; i < 6; i++) {
                        var dir = Math.random() * Math.PI * 2;
                        var speed = -(0.5 + Math.random() * 0.5);
                        var vx = Math.cos(dir) * speed + asteroideAntigo.vx, vy = Math.sin(dir) * speed + asteroideAntigo.vy;
                    }

                    for (var i = 0; i < 12; i++) {
                        var dir = Math.random() * Math.PI * 2;
                        var speed = -(0.5 + Math.random() * 0.5);
                        var vx = Math.cos(dir) * speed + asteroideAntigo.vx, vy = Math.sin(dir) * speed + asteroideAntigo.vy;
                    }

                    if (asteroideAntigo.radius >= 30) {
                        var numSplit = Math.floor(Math.random() * 2) + 2;
                        for (var k = 0; k < numSplit; k++) {
                            var dir = Math.atan2(asteroideAntigo.vy, asteroideAntigo.vx) + Math.random() * Math.PI / 2 - Math.PI / 4;
                            var speed = Math.sqrt(asteroideAntigo.vx * asteroideAntigo.vx + asteroideAntigo.vy * asteroideAntigo.vy) * (0.75 + Math.random() * 0.5);
                            var x = asteroideAntigo.x + Math.cos(dir) * Math.random() * asteroideAntigo.radius * 0.5;
                            var y = asteroideAntigo.y + Math.sin(dir) * Math.random() * asteroideAntigo.radius * 0.5;
                            var vx = Math.cos(dir) * speed, vy = Math.sin(dir) * speed;
                            var va = asteroideAntigo.va + Math.random() * asteroideAntigo.va * 0.5 - asteroideAntigo.va * 0.25;
                            asteroide[asteroide.length] = criarAsteroides(x, y, vx, vy, va, asteroideAntigo.radius / numSplit);
                        }
                    }
                    if (asteroide.length == 0)
                        tempoDeMudança = tempo + 50;
                    pontuacao += 1;
                    break;
                }
            }
	}
	
	if (tempo >= tempoDeMudança) {
            nivel += 1;
            estado = EstadoDoJogo._IniciandoNivel;
            tempoDeMudança = tempo + 150;
	}

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.globalAlpha = 1;
	
    desenharObjeto(nave);
    for (var i = 0; i < asteroide.length; i++)
        desenharObjeto(asteroide[i]);
	for (var i = 0; i < misseis.length; i++)
		desenharObjeto(misseis[i]);
	
    escreverNaTela();

    tempo += 1;
    intervalo -= 1;   
      
    }
    else{
        estado = EstadoDoJogo._FimDeJogo;
        pontuacao = 0;
        nivel = 0;
        escreverNaTela();
        if (estado == EstadoDoJogo._FimDeJogo){
             if (teclas[32]) {
               pontuacao = 0;
               vida = maxvidas;
               nivel = 1;
               jogo();
               teclas[32] = false;
               estado = EstadoDoJogo._IniciandoNivel;
               tempoDeMudança = tempo + 150;
           }
       }
    }
	
}

window.onload = function () {
    canvas = document.getElementById("canvas");
    context = canvas.getContext("2d");

    teclas = [];
    for (var i = 0; i < 256; i++)
        teclas[i] = false;

    document.onkeydown = function (event) {
        if (event.charCode) {
            teclas[event.charCode] = true;
            if ((event.charCode >= 37 && event.charCode <= 40) || event.charCode == 32)
                event.preventDefault();
	}
        else {
            teclas[event.keyCode] = true;
            if ((event.keyCode >= 37 && event.keyCode <= 40) || event.keyCode == 32)
                event.preventDefault();
        }
    }

    document.onkeyup = function (event) {
        if (event.charCode)
            teclas[event.charCode] = false;
        else
            teclas[event.keyCode] = false;
    }
    vida = maxvidas;
    
    pontuacao = 0;
    nivel = Math.random(1,50);
    estado = EstadoDoJogo._Titulo;
    jogo();
    
    setInterval(atualizarTela, 15);
};
