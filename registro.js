document.addEventListener("DOMContentLoaded", () => {
    const botonRegistro = document.querySelector(".boton-registro");
    const body = document.querySelector(".bodyIndex");
  
    const contenidoOriginalRegistro = body.innerHTML;
  
    
    let db;
    const request = indexedDB.open("BancNouDB", 1);
  
    request.onerror = (event) => {
      console.error("IndexedDB error:", event.target.error);
    };
  
    request.onsuccess = (event) => {
      db = event.target.result;
      console.log("IndexedDB cargada correctamente");
    };
  
    request.onupgradeneeded = (event) => {
      db = event.target.result;
      if (!db.objectStoreNames.contains("usuarios")) {
        db.createObjectStore("usuarios", { keyPath: "username" });
      }
    };
  
    botonRegistro.addEventListener("click", () => {
      body.innerHTML = `
        <h1 class="h1Registro">Registro - BancNou</h1>
        <div class="inputsRegistro">
            <input type="text" placeholder="Nombre" id="inputNombre">
            <input type="text" placeholder="Apellido" id="inputApellido">
            <input type="text" placeholder="Nombre de usuario" id="inputUsername">
            <input type="email" placeholder="Correo electrónico" id="inputEmail">
            <input type="password" placeholder="Contraseña" id="inputPassword">
            <input type="tel" placeholder="Número de teléfono" id="inputTelefono">
        </div>
        <div class="contenedorBotonesRegistro">
            <button id="botonRegistrar">REGISTRARME</button>
            <button id="volverBtn">VOLVER</button>
        </div>
      `;
  
      
      body.style.display = "flex";
      body.style.flexDirection = "column";
      body.style.justifyContent = "center";
      body.style.alignItems = "center";
      body.style.minHeight = "100vh";
      body.style.margin = "0";
  
      const inputsRegistro = document.querySelector(".inputsRegistro");
      inputsRegistro.style.display = "flex";
      inputsRegistro.style.flexDirection = "column";
      inputsRegistro.style.alignItems = "center";
      inputsRegistro.style.gap = "15px";
      inputsRegistro.style.marginBottom = "20px";
  
      document.querySelectorAll(".inputsRegistro input").forEach(input => {
        input.style.width = "300px";
        input.style.padding = "10px";
        input.style.border = "1px solid #ccc";
        input.style.borderRadius = "8px";
        input.style.fontSize = "16px";
      });
  
      const contenedorBotones = document.querySelector(".contenedorBotonesRegistro");
      contenedorBotones.style.display = "flex";
      contenedorBotones.style.justifyContent = "center";
      contenedorBotones.style.gap = "20px";
  
      const btnRegistrar = document.querySelector("#botonRegistrar");
      const volverBtn = document.querySelector("#volverBtn");
  
      [btnRegistrar, volverBtn].forEach(btn => {
        btn.style.padding = "10px 20px";
        btn.style.border = "none";
        btn.style.borderRadius = "10px";
        btn.style.backgroundColor = "#333";
        btn.style.color = "#fff";
        btn.style.cursor = "pointer";
      });
  
      volverBtn.addEventListener("click", () => {
        body.innerHTML = contenidoOriginalRegistro;
        window.location.reload();
      });
  

      btnRegistrar.addEventListener("click", () => {
        const nuevoUsuario = {
          nombre: document.querySelector("#inputNombre").value,
          apellido: document.querySelector("#inputApellido").value,
          username: document.querySelector("#inputUsername").value,
          email: document.querySelector("#inputEmail").value,
          password: document.querySelector("#inputPassword").value,
          telefono: document.querySelector("#inputTelefono").value,
          saldo: 0
        };
        
  
        if (!nuevoUsuario.username) {
          alert("El nombre de usuario es obligatorio.");
          return;
        }
  
        const transaction = db.transaction(["usuarios"], "readwrite");
        const store = transaction.objectStore("usuarios");
        const request = store.add(nuevoUsuario);
  
        request.onsuccess = () => {
          alert("Usuario registrado exitosamente");
          volverBtn.click();
        };
  
        request.onerror = () => {
          alert("Error al registrar. El usuario ya existe");
        };
      });
    });
  });
  