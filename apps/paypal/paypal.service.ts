import { Injectable, InternalServerErrorException } from "@nestjs/common";
import {
  CheckoutPaymentIntent,
  Client,
  Environment,
  LogLevel,
  OrderRequest,
  OrdersController,
} from "@paypal/paypal-server-sdk";

@Injectable()
export class PaypalService {
  private client: Client;
  private ordersController: OrdersController;

  constructor() {
    const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_ENV } = process.env;

    this.client = new Client({
      clientCredentialsAuthCredentials: {
        oAuthClientId: PAYPAL_CLIENT_ID || "",
        oAuthClientSecret: PAYPAL_CLIENT_SECRET || "",
      },
      environment:
        PAYPAL_ENV === "sandbox" ? Environment.Sandbox : Environment.Production,
      logging: {
        logLevel: LogLevel.Info,
        logRequest: { logBody: true },
        logResponse: { logHeaders: true },
      },
    });

    this.ordersController = new OrdersController(this.client);
  }

  async createOrder(params: { amount: number; orderId: string }) {
    const orderRequest: OrderRequest = {
      intent: CheckoutPaymentIntent.Capture, //CAPTURE,
      purchaseUnits: [
        {
          amount: { value: params.amount.toString(), currencyCode: "USD" },
          customId: params.orderId,
        },
      ],
    };

    try {
      const { body, ...httpResponse } =
        await this.ordersController.ordersCreate({
          body: orderRequest,
          prefer: "return=minimal",
        });
      return {
        jsonResponse: JSON.parse(body as string),
        httpStatusCode: httpResponse.statusCode,
      };
    } catch (error) {
      throw new InternalServerErrorException("failed_to_create_order");
    }
  }

  async captureOrder(orderID: string) {
    const collect = { id: orderID, prefer: "return=minimal" };

    try {
      const { body, ...httpResponse } =
        await this.ordersController.ordersCapture(collect);
      return {
        jsonResponse: JSON.parse(body as string),
        httpStatusCode: httpResponse.statusCode,
      };
    } catch (error) {
      throw new InternalServerErrorException("failed_to_capture_order");
    }
  }
}
