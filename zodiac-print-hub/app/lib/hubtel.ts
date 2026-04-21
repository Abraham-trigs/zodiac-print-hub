export const sendZodiacSMS = async (to: string, message: string) => {
  const credentials = Buffer.from(
    `${process.env.HUBTEL_CLIENT_ID}:${process.env.HUBTEL_CLIENT_SECRET}`,
  ).toString("base64");

  const response = await fetch("https://api.hubtel.com/v1/messages", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.HUBTEL_SENDER_ID,
      to,
      content: message,
      registeredDelivery: true,
    }),
  });

  return response.json();
};
