const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const app = express();

app.use(bodyParser.json());

const VERIFY_TOKEN = "frutibot";
const ACCESS_TOKEN = "EAAQZCBnIEMOkBO1HD7KdN73I8tZBl1dgkEJoH2HsFYMiYZCKBoFGGObSnHZCeH1ArNfRw2fLtJsU02ZA8jzMQZCTqTY5r6jtXQZByNNQgsUnmLLXP1AlPzXi5pNsTZBNPZAIZAzGkj7WBORn6Y5FvjpVWfW6IQywRBZBbC5soDiZAE9I8oPrhvsndAOXZCIBq6AaRZC6ZALbrsjl2Y11QEo85PS8mpM7TJglbgnISbSNM8X";
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

      // Detectar si pide el menú
      const quiereMenu = text.includes("menú") || text.includes("menu") || text.includes("ver el menú");

      if (quiereMenu) {
        await fetch(`https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${ACCESS_TOKEN}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: from,
            text: {
              body: 
`
Para hacer tu pedido fácil y rápido, visita:  
https://www.maspedidos.menu/frutitime/frutitime
 
            }
          })
        });

        console.log("📄 Menú con enlace enviado");
      }

      // Detectar saludos o intención de hacer un pedido
      const saludos = ["hola", "buenos días", "buenas tardes", "buen día", "buen dia"];
      const intencionPedido = [
        "quiero pedir", "hacer un pedido", "puedo pedir",
        "quiero ordenar", "me puedes tomar un pedido",
        "quiero una", "quisiera una", "quiero un", "quisiera un",
        "quiero hacer un pedido"
      ];

      const esSaludo = saludos.some(p => text.includes(p));
      const esPedido = intencionPedido.some(p => text.includes(p));

      if (esSaludo || esPedido) {
        await fetch(`https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${ACCESS_TOKEN}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: from,
            text: {
              body: "👋 Buen día *. Para hacer tu pedido fácil y rápido, visita:  
https://www.maspedidos.menu/frutitime/frutitime"
            }
          })
        });

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
