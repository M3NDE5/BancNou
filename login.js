const botonLogin = document.querySelector(".boton-login");
const body = document.querySelector(".bodyIndex");
const contenidoOriginal = body.innerHTML;

botonLogin.addEventListener("click", () => {
  body.innerHTML = `
    <h1 class="h1Boton">BancNou</h1>
    <div class="inputsLogin">
        <input type="text" placeholder="Usuario" id="inputUser">
        <input type="password" placeholder="Contraseña" id="inputPsw">
    </div>
    <div class="contenedorBotonesLogin">
        <button id="BotonAceptar">ACEPTAR</button>
        <button id="volverBtn">VOLVER</button>
    </div>
  `;

  const btnAceptar = document.querySelector("#BotonAceptar");
  const volverBtn = document.querySelector("#volverBtn");
  const inputUsuario = document.querySelector("#inputUser");
  const inputpassword = document.querySelector("#inputPsw");
  const titulo = document.querySelector(".h1Boton");
  const inputsLogin = document.querySelector(".inputsLogin");
  const contenedorBotonesLogin = document.querySelector(".contenedorBotonesLogin");

  body.style.display = "flex";
  body.style.flexDirection = "column";
  body.style.justifyContent = "center";
  body.style.alignItems = "center";
  body.style.minHeight = "100vh";
  body.style.margin = "0";

  titulo.style.color = "red";
  titulo.style.textAlign = "center";
  titulo.style.marginBottom = "20px";

  inputsLogin.style.display = "flex";
  inputsLogin.style.flexDirection = "column";
  inputsLogin.style.alignItems = "center";
  inputsLogin.style.gap = "15px";
  inputsLogin.style.marginBottom = "20px";

  inputUsuario.style.width = "300px";
  inputpassword.style.width = "300px";
  inputUsuario.style.padding = "10px";
  inputpassword.style.padding = "10px";

  contenedorBotonesLogin.style.display = "flex";
  contenedorBotonesLogin.style.justifyContent = "center";
  contenedorBotonesLogin.style.gap = "20px";

  [btnAceptar, volverBtn].forEach(btn => {
    btn.style.padding = "10px 20px";
    btn.style.border = "none";
    btn.style.borderRadius = "10px";
    btn.style.backgroundColor = "#333";
    btn.style.color = "#fff";
    btn.style.cursor = "pointer";
  });

  volverBtn.addEventListener("click", () => {
    body.innerHTML = contenidoOriginal;
    window.location.reload();
  });

  btnAceptar.addEventListener("click", () => {
    const usuarioIngresado = inputUsuario.value;
    const contrasenaIngresada = inputpassword.value;

    const request = indexedDB.open("BancNouDB", 1);

    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(["usuarios"], "readonly");
      const store = transaction.objectStore("usuarios");

      const getRequest = store.get(usuarioIngresado);

      getRequest.onsuccess = () => {
        const usuarioGuardado = getRequest.result;

        if (!usuarioGuardado) {
          alert("Usuario no encontrado.");
          return;
        }

        if (usuarioGuardado.password !== contrasenaIngresada) {
          alert("Contraseña incorrecta.");
          return;
        }

        // Asegurar que tenga el array de movimientos
        if (!usuarioGuardado.movimientos) {
          usuarioGuardado.movimientos = [];
        }

        function agregarMovimiento(tipo, monto, destino = null) {
          const fecha = new Date().toLocaleString();
          usuarioGuardado.movimientos.push({ tipo, monto, fecha, destino });
        }

        // Interfaz principal
        body.innerHTML = `
          <h1>¡Bienvenido, ${usuarioGuardado.nombre}!</h1>
          <p>Has iniciado sesión como <strong>${usuarioGuardado.username}</strong>.</p>
          <p>Tu saldo es: $<strong id="saldoTexto">${usuarioGuardado.saldo}</strong></p>
          <div class="acciones">
            <button id="botonConsignar">CONSIGNAR</button>
            <button id="botonRetirar">RETIRAR</button>
            <button id="botonEnviar">ENVIAR DINERO</button>
            <button id="botonMovimientos">MOVIMIENTOS</button>
            <button id="botonRegresar">REGRESAR</button>
          </div>
        `;

        const saldoTexto = document.getElementById("saldoTexto");
        const botonConsignar = document.getElementById("botonConsignar");
        const botonRetirar = document.getElementById("botonRetirar");
        const botonEnviar = document.getElementById("botonEnviar");
        const botonMovimientos = document.getElementById("botonMovimientos");
        const botonRegresar = document.getElementById("botonRegresar");

        [botonConsignar, botonRetirar, botonEnviar, botonMovimientos, botonRegresar].forEach(btn => {
          btn.style.padding = "10px 20px";
          btn.style.margin = "10px";
          btn.style.borderRadius = "10px";
          btn.style.border = "none";
          btn.style.backgroundColor = "#333";
          btn.style.color = "white";
          btn.style.cursor = "pointer";
        });

        // CONSIGNAR
        botonConsignar.addEventListener("click", () => {
          const monto = prompt("¿Cuánto deseas consignar?");
          const cantidad = parseFloat(monto);

          if (isNaN(cantidad) || cantidad <= 0) {
            alert("Monto inválido.");
            return;
          }

          const trans = db.transaction(["usuarios"], "readwrite");
          const store = trans.objectStore("usuarios");

          usuarioGuardado.saldo += cantidad;
          agregarMovimiento("Consignación", cantidad);
          store.put(usuarioGuardado);

          trans.oncomplete = () => {
            saldoTexto.textContent = usuarioGuardado.saldo;
            alert("Dinero consignado exitosamente.");
          };
        });

        // RETIRAR
        botonRetirar.addEventListener("click", () => {
          const monto = prompt("¿Cuánto deseas retirar?");
          const cantidad = parseFloat(monto);

          if (isNaN(cantidad) || cantidad <= 0 || cantidad > usuarioGuardado.saldo) {
            alert("Monto inválido o saldo insuficiente.");
            return;
          }

          const trans = db.transaction(["usuarios"], "readwrite");
          const store = trans.objectStore("usuarios");

          usuarioGuardado.saldo -= cantidad;
          agregarMovimiento("Retiro", cantidad);
          store.put(usuarioGuardado);

          trans.oncomplete = () => {
            saldoTexto.textContent = usuarioGuardado.saldo;
            alert("Retiro realizado con éxito.");
          };
        });

        // ENVIAR DINERO
        botonEnviar.addEventListener("click", () => {
          const destinatario = prompt("¿A qué usuario deseas enviar dinero?");
          const monto = parseFloat(prompt("¿Cuánto deseas enviar?"));

          if (isNaN(monto) || monto <= 0 || monto > usuarioGuardado.saldo) {
            alert("Monto inválido o saldo insuficiente.");
            return;
          }

          const trans = db.transaction(["usuarios"], "readwrite");
          const store = trans.objectStore("usuarios");

          const reqDest = store.get(destinatario);

          reqDest.onsuccess = () => {
            const usuarioDestino = reqDest.result;

            if (!usuarioDestino) {
              alert("El usuario al que intentas enviar no existe.");
              return;
            }

            usuarioGuardado.saldo -= monto;
            usuarioDestino.saldo += monto;

            agregarMovimiento("Envío", monto, usuarioDestino.username);
            if (!usuarioDestino.movimientos) {
              usuarioDestino.movimientos = [];
            }
            usuarioDestino.movimientos.push({
              tipo: "Recepción",
              monto,
              fecha: new Date().toLocaleString(),
              destino: usuarioGuardado.username
            });

            store.put(usuarioGuardado);
            store.put(usuarioDestino);

            trans.oncomplete = () => {
              saldoTexto.textContent = usuarioGuardado.saldo;
              alert(`Enviaste $${monto} a ${usuarioDestino.nombre}.`);
            };
          };
        });

        // MOVIMIENTOS
        botonMovimientos.addEventListener("click", () => {
          if (!usuarioGuardado.movimientos || usuarioGuardado.movimientos.length === 0) {
            alert("No hay movimientos aún.");
            return;
          }

          const historial = usuarioGuardado.movimientos
            .map(mov => {
              const base = `${mov.fecha} - ${mov.tipo}: $${mov.monto}`;
              return mov.destino ? `${base} a ${mov.destino}` : base;
            })
            .join("\n");

          alert(`Historial de movimientos:\n\n${historial}`);
        });

        // REGRESAR
        botonRegresar.addEventListener("click", () => {
          body.innerHTML = contenidoOriginal;
          window.location.reload();
        });

      };
    };
  });
});
