import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function (req, res) {
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message: "OpenAI API key not configured, please follow instructions in README.md",
      }
    });
    return;
  }

  const question = req.body.question || '';
  if (question.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please enter issue description",
      }
    });
    return;
  }

 try { 

   const completion = await openai.createChatCompletion({
    model: "gpt-4",
    temperature: 0.888,
    messages: [{role: "system", content: "You are a helpful assistant.You are helping technical support specialists at Vinted company using MangoPay, Adyen and Checkout PSPs to find the reason why payout is failing. Vinted operates in different countries, one country can use only one PSP. You are given a previous known issues related to failing payouts. Please be a very specific and technical. Please don't recommend to contact PSPs"}, 
               {role: "user", content: 'Why I cannot make a payout?"'}, 
               {role: "assistant", content: "Based on the information provided, the payout is failing because of an incorrect input of bank details. The IBAN provided by the customer seems to be incorrect. It is suggested to verify the IBAN entered by the customer to resolve the issue. It is not known if similar incidents are occurring without further information or additional tickets."},
               {role: "user", content: "Hi, this member deleted account even though they have money on MGP side. On Vinted side, the wallet is empty, which is strange. Could you please investigate what happened? If those 10.93 EUR really belongs to member, ideally I’d like to inform them about it and restore their account, so they would be able to payout and delete account again."},
               {role: "assistant", content: "Hey, I can confirm that the member does not have any funds to payout. In MGP page MANGOPAY  we can see that there is 10.93 EUR balance in the escrow wallet. It means that these funds are meant for the seller due to the transaction and payment. But, after the investigation, we can see that the seller is blocked from MGP side (MANGOPAY) therefore these funds cannot be accepted by him. Let me know if this is clear of if I should clarify more."},
               {role: "user", content: question}
    ]
    }, { timeout: 60000 });

    res.status(200).json({ result: completion.data.choices[0].message.content.trim()});
  } catch(error) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: 'An error occurred during your request.',
        }
      });
    }
  }
}

