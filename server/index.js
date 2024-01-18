const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');

require('dotenv').config();
const cors = require('cors');

const app = express();

const PORT = process.env.PORT

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.post('/placeorder', async (req, res) => {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_ID,
      key_secret: process.env.RAZORPAY_SECRET
    });

    const options = {
      amount: 50000,
      currency: 'INR',
      receipt: 'fdfs211'
    }
    const order = await razorpay.orders.create(options);

    if (!order) {
      return res.status(500).send('Error');
    }
    return res.json(order);
  } catch (error) {
    console.log(error);
    return res.status(500).send('Error');
  }
});

app.post('/order/verify', async (req, res) => {
  console.log(req.body);

  const {razorpay_payment_id, razorpay_order_id, razorpay_signature} = req.body;
  const sha = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET);
  sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const digest = sha.digest('hex')

  if(digest != razorpay_signature){
    return res.send(400).json({msg: 'Transaction is not legit'});
  }
  return res.json({
    msg: 'Successful',
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id
  })
});

app.listen(PORT, () => {
  console.log('Listening on portttt', PORT);
});
