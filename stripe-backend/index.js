import express from "express";
import cors from 'cors';
import Stripe from "stripe";
import { v4 as uuidv4 } from "uuid";
import "dotenv/config";


const app = express();

const port = 3300;


app.use(express.json());
app.use(cors());

// TODO add a stripe key
const stripe = new Stripe(process.env.stripe_secret_key);



//   routes

app.get("/", (req,res)=>{
 res.send("Server is running");
})


// app.post("/payment",(req,res)=>{
//     const data = req.body
//     console.log("data",data);
//     console.log("api hits");
//     const {token , product} = req.body
//     console.log("product",product);
//     console.log("token",token);
//     console.log("product",product.price);
//     const idempotencyKey = uuidv4();

//     return stripe.customers.create({
//         email: token.email,
//         source: token.id,
//     }).then(customer =>{
//         stripe.charges.create({
//             amount : product.price*100,
//             currency:'usd',
//             customer:customer.id,
//             receipt_email:token.email,
//             description: `purchase of ${product.name}`,
//             shipping:{
//                 name :token.card.name,
//                 address:{
//                     country:token.card.address_country
//                 }
//             }
//         },{idempotencyKey})
//     })
//     .then(result => res.status(200).json(result))
//     .catch(err => console.log(err))
// })


app.post("/payment", async (req, res) => {
    const { product } = req.body;
    console.log("Received product details:", product);

    try {
        const items = product.map(item => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.name,

                },
                unit_amount: item.price * 100,  // Price should be in cents
            },
            quantity: 1
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: items,
            mode: "payment",
            success_url: 'http://localhost:3300/success',  // Redirect URLs after payment
            cancel_url: 'http://localhost:3300/cancel',
        });

        res.json({ id: session.id });
    } catch (error) {
        console.error("Error creating Stripe session:", error);
        res.status(400).json({ error: error.message });
    }
});

// app.post("/payment", async (req, res) => {
//     const { product } = req.body;
//     console.log("Received product details:", product);

//     try {
//         // Sum up the total price
//         const totalAmount = product.reduce((total, item) => {
//             return total + (item.price * 100); // Convert price to cents
//         }, 0);

//         const paymentIntent = await stripe.paymentIntents.create({
//             amount: totalAmount,  // Total amount in cents
//             currency: 'usd',
//             // Optionally, you could pass additional metadata here:
//             metadata: { integration_check: 'accept_a_payment' }
//         });

//         // Respond with the client secret and any other relevant details
//         res.json({
//             clientSecret: paymentIntent.client_secret,
//             id: paymentIntent.id
//         });
//     } catch (error) {
//         console.error("Error creating payment intent:", error);
//         res.status(400).json({ error: error.message });
//     }
// });


//listen 

app.listen(port, () => {
    console.log(`Server started on port: http://localhost:${port} `);
}); 