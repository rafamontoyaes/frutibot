const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = "frutitime123";
const WHATSAPP_TOKEN = "EAAJcShZB85M4BO9k2FrpE5v0zn8q8oDSRuILr8OI3NcPscVAVxPa34va5tWTCdXIxmhxO8pq0LHTcnpuSDuEgXvltioi9vZC4OQ7Qyp2MxHlWux4nPHqEvZA0H4MZCXbB7lytVTbap3Pt9HSB3yvtZBMm3ZAKjrCJBff5AU800gsqptPRPdvUZCd2l1bwONb53S9wY1VPrD0T5AgcNZBd1s6dY8ic5X5ZCFRIHaZBF";
const PHONE_NUMBER_ID = "688467581005806";

// Verificación del webhook
app.get('/webhook', (req, res) => {
    const verify_token = VERIFY_TOKEN;
  
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
  
    if (mode === "subscribe" && token === verify_token) {
      console.log("Webhook verificado correctamente.");
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  });
// Manejo de mensajes
app.post("/webhook", async (req, res) => {
    const body = req.body;

    if (body.object) {
        const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

        if (message) {
            const from = message.from;
            const text = message.text?.body;

            console.log('Mensaje de ${from}: ${text}');

            await axios.post(
                'https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages',
                {
                    messaging_product: "whatsapp",
                    to: from,
                    text: { body: "Gracias por escribir a Fruti Time. ¿En qué podemos ayudarte hoy?" },
                },
                {
                    headers: {
                        Authorization: 'Bearer ${WHATSAPP_TOKEN}',
                        "Content-Type": "application/json",
                    },
                }
            );
        }

        res.sendStatus(200);
    } else {
        res.sendStatus(404);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Servidor escuchando en el puerto", PORT);
});