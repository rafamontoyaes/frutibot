const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = "frutitime123";
const WHATSAPP_TOKEN = "EAAJcShZB85M4BO1a3GhpyDZBVDc5QaZBuJHkDkILqiJqglYUcD1a5IglvNeZAz5zhv0vJOw13ZAk1mdxICpk4AXzZA3y1wGXmZCpkvDBJ6pKtsun9eKoI2T7hV3GXAXnnJfVyUCzZCpqotbiZBpkrKF39Qva2tXfF4dghasGGGABxurvcr3u6HJXyrenYxwRMhqOKyacGib37QGasdMwRpogyEMLZB8u935Tdb0w2gtgZDZD";
const PHONE_NUMBER_ID = "688467581005806";

// Verificación del webhook
app.get("/webhook", (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
        console.log("Webhook verificado correctamente");
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