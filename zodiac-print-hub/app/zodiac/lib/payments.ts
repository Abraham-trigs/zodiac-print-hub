export const initiateSubscriptionPayment = async (
  phoneNumber: string,
  amount: number,
  planName: string,
) => {
  const credentials = Buffer.from(
    `${process.env.HUBTEL_CLIENT_ID}:${process.env.HUBTEL_CLIENT_SECRET}`,
  ).toString("base64");

  const formattedNumber = phoneNumber.startsWith("0")
    ? `233${phoneNumber.substring(1)}`
    : phoneNumber;

  const response = await fetch(
    `https://api.hubtel.com/v1/merchantaccount/merchants/${process.env.HUBTEL_MERCHANT_ID}/receive/mobilemoney`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        CustomerName: "Zodiac User",
        CustomerMsisdn: formattedNumber,
        Channel: "mtn-gh",
        Amount: amount.toFixed(2),
        PrimaryCallbackUrl: `${process.env.BASE_URL}/api/payments/webhook`,
        Description: `Zodiac Subscription: ${planName}`,
        ClientReference: `ZOD-${Date.now()}`,
      }),
    },
  );

  return response.json();
};
