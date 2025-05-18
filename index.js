const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const app = express();

app.use(bodyParser.json());

const VERIFY_TOKEN = "frutibot";
const ACCESS_TOKEN = "EAAQZCBnIEMOkBOzy1FpjiRZB6YA1ANWslADBdi7nJBHJUNZCp3h3qop49d5ZB91Rwhb33Pk7ovwSuBIxP8wQYEjgFXSQstF1la6kkiLWFmjWUdMCAlMgmDiIGvSQjb7Mxh7SpURahNPqGScMjEhEIWm6CvkRAMdLxY0xbQlkB8LS759miEYPIwNegZAeYNV4E0KPK820rIk4sLt0rnxDOUBohhsOvHkfZC0is4";
const PHONE_NUMBER_ID = "688467581005806";

// Ruta de inicio
app.get("/", (req, res) => {
  res.send("Fruti Bot está activo 🍓🤖");
});

// Verificación del webhook
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token && mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("🔐 Webhook verificado");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Función para enviar mensajes y loguear respuesta API
async function sendMessage(to, message) {
  const res = await fetch(`https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      text: { body: message }
    })
  });

  const data = await res.json();
  console.log("Respuesta API al enviar mensaje:", data);
  return data;
}

// Recepción de mensajes
app.post("/webhook", async (req, res) => {
  const body = req.body;

  if (body.object) {
    const entry = body.entry?.[0];
    const change = entry?.changes?.[0];
    const message = change?.value?.messages?.[0];

    if (message && message.text && message.from) {
      const text = message.text.body.toLowerCase();
      const from = message.from;
      console.log(`📩 Mensaje recibido de: ${from}\nTexto: ${text}`);

      const frasesClave = [
        "hola", "buenos días", "buen día", "buen dia", "buenas tardes",
        "quiero hacer un pedido", "quiero pedir", "hacer un pedido",
        "puedo pedir", "quiero ordenar", "me puedes tomar un pedido",
        "quiero una", "quisiera una", "quiero un", "quisiera un",
        "tienen servicio"
      ];

      const contieneFraseClave = frasesClave.some(frase => text.includes(frase));

      if (contieneFraseClave) {
        const mensajeRespuesta = 
          "👋 Buen día *. Para hacer tu pedido fácil y rápido, visita: https://www.maspedidos.menu/frutitime/frutitime";
        await sendMessage(from, mensajeRespuesta);
        console.log("✅ Respuesta enviada");
      }
    }

    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en el puerto ${PORT}`);
});
