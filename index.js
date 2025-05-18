const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const app = express();

app.use(bodyParser.json());

const VERIFY_TOKEN = "frutibot"; // Token para verificar webhook
const ACCESS_TOKEN = "EAAQZCBnIEMOkBO1HD7KdN73I8tZBl1dgkEJoH2HsFYMiYZCKBoFGGObSnHZCeH1ArNfRw2fLtJsU02ZA8jzMQZCTqTY5r6jtXQZByNNQgsUnmLLXP1AlPzXi5pNsTZBNPZAIZAzGkj7WBORn6Y5FvjpVWfW6IQywRBZBbC5soDiZAE9I8oPrhvsndAOXZCIBq6AaRZC6ZALbrsjl2Y11QEo85PS8mpM7TJglbgnISbSNM8X";
const PHONE_NUMBER_ID = "688467581005806";

// Ruta principal
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

      const saludos = ["hola", "buenos dias", "buenos días", "buen día", "buen dia"];
      const esSaludo = saludos.some(saludo => text.includes(saludo));

      if (esSaludo) {
        try {
          const response = await fetch(`https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${ACCESS_TOKEN}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              messaging_product: "whatsapp",
              to: from,
              text: {
                body: "🟢 Fruti Bot está funcionando y te acaba de responder este mensaje. ¿En qué te puedo ayudar?"
              }
            })
          });

          if (!response.ok) {
            console.error("❌ Error al enviar respuesta:", await response.text());
          } else {
            console.log("✅ Respuesta enviada");
          }
        } catch (error) {
          console.error("❌ Error en fetch:", error);
        }
      }
    }

    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en el puerto ${PORT}`);
});
