require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sgMail = require('@sendgrid/mail');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Set your SendGrid API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Email sending endpoint
app.post('/send-order-confirmation', async (req, res) => {
    try {
        const { orderData } = req.body;
        
        const msg = {
            to: orderData.email,
            from: 'gsumeet206@gmail.com', // Your verified sender email
            subject: 'Shop Genie - Order Confirmation',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background-color: #161880; color: white; padding: 20px; text-align: center;">
                        <h1>Order Confirmation</h1>
                    </div>
                    
                    <div style="padding: 20px;">
                        <h2>Thank you for your order!</h2>
                        <p>Dear ${orderData.customerName},</p>
                        <p>Your order has been successfully placed.</p>
                        
                        <div style="margin: 20px 0; padding: 20px; border: 1px solid #ddd;">
                            <h3>Order Details</h3>
                            <p><strong>Order ID:</strong> ${orderData.orderId}</p>
                            <p><strong>Product:</strong> ${orderData.productName}</p>
                            <p><strong>Price:</strong> ₹${orderData.price}</p>
                            
                            <h3>Shipping Information</h3>
                            <p><strong>Address:</strong> ${orderData.address}</p>
                            <p><strong>Phone:</strong> ${orderData.phone}</p>
                        </div>
                    </div>
                </div>
            `
        };

        await sgMail.send(msg);
        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to send email' });
    }
});

// Add a new endpoint to handle payment options
app.post('/api/payment-options', (req, res) => {
  try {
    const { paymentMethod, orderDetails, upiDetails } = req.body;
    
    // Validate payment method
    if (!['free-delivery', 'upi'].includes(paymentMethod)) {
      return res.status(400).json({ error: 'Invalid payment method. Choose Free Delivery or UPI.' });
    }
    
    // Handle UPI payment
    if (paymentMethod === 'upi' && !upiDetails) {
      return res.status(400).json({ error: 'UPI details are required for UPI payment.' });
    }
    

    
    return res.status(200).json({ 
      success: true, 
      message: `Order placed successfully with ${paymentMethod} payment option.`,
      orderReference: `ORD-${Date.now()}`
    });
  } catch (error) {
    console.error('Payment processing error:', error);
    return res.status(500).json({ error: 'Failed to process payment option.' });
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});