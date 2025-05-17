const express = require("express");
const fetch = require("node-fetch");
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para procesar JSON
app.use(express.json());

// Ruta para verificar el webhook
app.get("/webhook", (req, res) => {
  const VERIFY_TOKEN = "frutibot_token";
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

// Ruta para recibir mensajes
app.post("/webhook", (req, res) => {
  const entry = req.body.entry?.[0];
  const changes = entry?.changes?.[0];
  const value = changes?.value;
  const messages = value?.messages;

  if (!messages) {
    return res.sendStatus(200);
  }

  const message = messages[0];
  const from = message.from;
  const text = message.text?.body || "";

  console.log(`Mensaje recibido de: ${from}`);
  console.log(`Texto: ${text}`);

  // Si el mensaje dice "Buenos dias", responde
  if (text.toLowerCase() === "buenos dias") {
    const responseBody = {
      messaging_product: "whatsapp",
      to: from,
      text: {
        body: "¡Buenos días! Gracias por escribir a Fruti Time. ¿En qué te puedo ayudar?"
      }
    };

    fetch("https://graph.facebook.com/v17.0/688467581005806/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer EAAQZCBnIEMOkBOy1d4ZCoxNwRpxsgO1HbvEv9QntbeZARvDiPPYVRamZAj1ZC70rOzcqOzOFZBoB3qujQ1PtoZCE9RJzUy4n9b3cHlTgcwyCZCdvwGsMSZAcq9tly82tCBUyMHhFJewl3CPGdbjtqJt3467lkgXk8KZBLc5GuoNUwcXkZBq1Meo14V7zlF7X8ZAL0Qp9fLwBxouKvXEqFEkd6edYFFUnawg9ZArYAeJAf`
      },
      body: JSON.stringify(responseBody)
    })
      .then(() => console.log("✅ Respuesta enviada"))
      .catch((err) => console.error("❌ Error al responder:", err));
  }

  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
