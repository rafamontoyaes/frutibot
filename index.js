const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Fruti Bot está activo 🍓");
});

app.get("/webhook", (req, res) => {
  const VERIFY_TOKEN = "frutibot_token";

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("WEBHOOK VERIFICADO");
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(400);
  }
});

app.post("/webhook", (req, res) => {
  const entry = req.body.entry?.[0];
  const changes = entry?.changes?.[0];
  const message = changes?.value?.messages?.[0];

  if (message) {
    const from = message.from;
    console.log("Mensaje recibido de:", from);
  }

  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Fruti Bot corriendo en puerto ${PORT}`);

  if (text.toLowerCase() === "buenos dias") {
  // Aquí enviamos la respuesta
  const responseBody = {
    messaging_product: "whatsapp",
    to: from,
    text: { body: "¡Buenos días! Gracias por escribir a Fruti Time. ¿En qué te puedo ayudar?" }
  };

  fetch("https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer YOUR_ACCESS_TOKEN`
    },
    body: JSON.stringify(responseBody)
  })
  .then(() => console.log("Mensaje de respuesta enviado"))
  .catch((err) => console.error("Error enviando respuesta:", err));
}

});

