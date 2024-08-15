import { join } from "path";
import {
  createBot,
  createProvider,
  createFlow,
  addKeyword,
  utils,
  EVENTS,
  addAnswer,
} from "@builderbot/bot";
import { MemoryDB as Database } from "@builderbot/bot";
import GeminiService from "./services/GeminiService";
import { BaileysProvider as Provider } from "@builderbot/provider-baileys";
import { convertOrderMessagePrompt } from "./prompts/convert-order-message";
import { menuMessage } from "./messages/menu-message";
import { availableProducts } from "./MOCK/available-products";
import { getReadableMessageFromOrderList } from "./utils/get-readable-message-from-order-list";
import { optionMessage } from "./messages/fallback-message";
import { welcomeMessage } from "./messages/welcome-message";

const PORT = process.env.PORT ?? 3008;

const welcomeFlow = addKeyword<Provider, Database>(EVENTS.WELCOME).addAction(
  async (ctx, ctxFn) => {
    const message = ctx.body.toLowerCase();

    const ORDER_WORDS = [
      "pedido",
      "quiero",
      "necesito",
      "comprar",
      "me mandas",
    ];

    const isAnOrder = ORDER_WORDS.some((word) => message.includes(word));

    if (isAnOrder) return await ctxFn.gotoFlow(orderFlow);
    return await ctxFn.gotoFlow(menuFlow);
  }
);

const fallbackFlow = addKeyword<Provider, Database>(EVENTS.ACTION)
.addAnswer(optionMessage)
.addAnswer(menuMessage)

const menuFlow = addKeyword<Provider, Database>(EVENTS.ACTION)
.addAnswer(welcomeMessage)
.addAnswer(
  menuMessage,
  { capture: true },
  async (ctx, ctxFn) => {
    const message = ctx.body.toLowerCase();

    if (message.includes("1")) {
      return await ctxFn.gotoFlow(orderFlow);
    } else if (message.includes("2")) {
      return await ctxFn.gotoFlow(orderOnlineFlow);
    } else if (message.includes("3")) {
      return await ctxFn.gotoFlow(productsFlow);
  } else {
    return await ctxFn.gotoFlow(fallbackFlow)
  }
});

const orderFlow = addKeyword<Provider, Database>(EVENTS.ACTION).addAnswer(
  "Por favor, escribe tu pedido.",
  { capture: true },
  async (ctx, ctxFn) => {
    const orderMessage = ctx.body;
    const orderMessagePrompt = convertOrderMessagePrompt(availableProducts, orderMessage);
    const response = await GeminiService.getFromPrompt(orderMessagePrompt);

    const order = JSON.parse(response);
    console.log(order);
    const answer = getReadableMessageFromOrderList(order);

    await ctxFn.flowDynamic(answer)
    await ctxFn.gotoFlow(orderConfirmationFlow);
  });

const orderOnlineFlow = addKeyword<Provider, Database>(EVENTS.ACTION).addAnswer(
  "www.elcharly.com"
);

const productsFlow = addKeyword<Provider, Database>(EVENTS.ACTION).addAnswer(
  "www.elcharly.com/products"
);

const orderConfirmationFlow = addKeyword<Provider, Database>(EVENTS.ACTION).addAnswer(
  "¿Deseas confirmar tu pedido?",
  { capture: true },
  async (ctx, ctxFn) => {
    const message = ctx.body.toLowerCase();
    if (message.includes("si")) {
      console.log(message);  
      return await ctxFn.gotoFlow(orderFlow);
    } else if (message.includes("no")) {
      console.log(message);  
      return await ctxFn.gotoFlow(menuFlow);
    } else {
      console.log(message);  
      return await ctxFn.gotoFlow(fallbackFlow)
    }
  }
);

const main = async () => {
  const adapterFlow = createFlow([welcomeFlow, menuFlow, orderFlow]);

  const adapterProvider = createProvider(Provider);
  const adapterDB = new Database();

  const { handleCtx, httpServer } = await createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  });

  adapterProvider.server.post(
    "/v1/messages",
    handleCtx(async (bot, req, res) => {
      const { number, message, urlMedia } = req.body;
      await bot.sendMessage(number, message, { media: urlMedia ?? null });
      return res.end("sended");
    })
  );

  adapterProvider.server.post(
    "/v1/register",
    handleCtx(async (bot, req, res) => {
      const { number, name } = req.body;
      await bot.dispatch("REGISTER_FLOW", { from: number, name });
      return res.end("trigger");
    })
  );

  adapterProvider.server.post(
    "/v1/samples",
    handleCtx(async (bot, req, res) => {
      const { number, name } = req.body;
      await bot.dispatch("SAMPLES", { from: number, name });
      return res.end("trigger");
    })
  );

  adapterProvider.server.post(
    "/v1/blacklist",
    handleCtx(async (bot, req, res) => {
      const { number, intent } = req.body;
      if (intent === "remove") bot.blacklist.remove(number);
      if (intent === "add") bot.blacklist.add(number);

      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ status: "ok", number, intent }));
    })
  );

  httpServer(+PORT);
};

main();
